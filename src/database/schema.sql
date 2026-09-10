CREATE TABLE IF NOT EXISTS servers (
    id CHAR(36) NOT NULL,
    discord_guild_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    setup_complete BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (id),
    UNIQUE KEY uq_servers_discord_guild_id (discord_guild_id)
);


CREATE TABLE IF NOT EXISTS server_roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    server_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    discord_role_id VARCHAR(20) NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_server_roles (
        server_id,
        type,
        `key`
    ),

    CONSTRAINT fk_server_roles_server
        FOREIGN KEY (server_id)
        REFERENCES servers(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS server_channels (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    server_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'channel',
    `key` VARCHAR(100) NOT NULL,
    discord_channel_id VARCHAR(20) NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_server_channels (
        server_id,
        type,
        `key`
    ),

    CONSTRAINT fk_server_channels_server
        FOREIGN KEY (server_id)
        REFERENCES servers(id)
        ON DELETE CASCADE
);