using Microsoft.EntityFrameworkCore;
using Tracker.Data;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Campaign Tracker API", Version = "v1" });
});

// --- Database ---
// Dev: SQLite (no installation needed)
// Prod/Azure: SQL Server (set ConnectionStrings:DefaultConnection in env/config)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite("Data Source=CampaignTracker.db"));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// --- CORS (allow AdminView React app) ---
// Vite auto-increments port when 5173 is busy (5174, 5175, ...) so we allow a range
builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminViewPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Allow any localhost origin in dev – no port surprises
            policy
                .SetIsOriginAllowed(origin =>
                {
                    var uri = new Uri(origin);
                    return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            // Prod: restrict to your real domain
            policy
                .WithOrigins("https://your-admin-domain.com")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

// --- Auto-migrate on startup ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    var conn = db.Database.GetDbConnection();
    await conn.OpenAsync();

    // Helper: check if column exists
    async Task<bool> ColumnExists(string table, string column)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"PRAGMA table_info({table})";
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            if (reader.GetString(1) == column) return true;
        return false;
    }

    // If old IsUnique column exists → rebuild Visits table with new schema
    // SQLite doesn't support DROP/MODIFY COLUMN, so we recreate the table
    if (await ColumnExists("Visits", "IsUnique"))
    {
        async Task Exec(string sql)
        {
            using var c = conn.CreateCommand();
            c.CommandText = sql;
            await c.ExecuteNonQueryAsync();
        }

        await Exec(@"CREATE TABLE IF NOT EXISTS Visits_new (
            Id               INTEGER PRIMARY KEY AUTOINCREMENT,
            CampaignId       INTEGER NOT NULL REFERENCES Campaigns(Id) ON DELETE CASCADE,
            VisitorId        TEXT    NOT NULL,
            IsUniqueGlobal   INTEGER NOT NULL DEFAULT 0,
            IsUniqueCampaign INTEGER NOT NULL DEFAULT 0,
            IpAddress        TEXT,
            Country          TEXT,
            City             TEXT,
            UserAgent        TEXT,
            Browser          TEXT,
            DeviceType       TEXT,
            OperatingSystem  TEXT,
            Referer          TEXT,
            VisitedAt        TEXT    NOT NULL
        )");

        await Exec(@"INSERT INTO Visits_new
            (Id, CampaignId, VisitorId, IsUniqueGlobal, IsUniqueCampaign,
             IpAddress, Country, City, UserAgent, Browser, DeviceType, OperatingSystem, Referer, VisitedAt)
            SELECT
             Id, CampaignId, VisitorId, IsUnique, IsUnique,
             IpAddress, Country, City, UserAgent, Browser, DeviceType, OperatingSystem, Referer, VisitedAt
            FROM Visits");

        await Exec("DROP TABLE Visits");
        await Exec("ALTER TABLE Visits_new RENAME TO Visits");
        await Exec("CREATE INDEX IF NOT EXISTS IX_Visits_CampaignId ON Visits(CampaignId)");
        await Exec("CREATE INDEX IF NOT EXISTS IX_Visits_VisitedAt  ON Visits(VisitedAt)");
    }

    conn.Close();
}

// --- Middleware ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AdminViewPolicy");
// app.UseHttpsRedirection(); // disabled for local dev convenience
app.UseAuthorization();
app.MapControllers();

app.Run();