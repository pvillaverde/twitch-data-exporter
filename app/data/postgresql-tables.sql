CREATE TABLE IF NOT EXISTS channel (
    id varchar(255),
    login VARCHAR(255) NOT NULL,
    display_name varchar(255) NOT NULL,
    type VARCHAR(255),
    broadcaster_type varchar(255),
    description text,
    profile_image_url varchar(255),
    offline_image_url varchar(255),
    view_count integer,
    created_at timestamp NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS channel_views (
    channel_id varchar(255),
    views bigint,
    datetime timestamp NOT NULL,
    PRIMARY KEY (channel_id, datetime)
);
ALTER TABLE channel_views DROP CONSTRAINT IF EXISTS FK_channel_channelviews;
ALTER TABLE channel_views
    ADD CONSTRAINT FK_channel_channelviews FOREIGN KEY (channel_id) REFERENCES channel;

CREATE TABLE IF NOT EXISTS channel_follows (
    from_id varchar(255),
    from_login varchar(255),
    from_name varchar(255),
    to_id varchar(255),
    to_login varchar(255),
    to_name varchar(255),
    followed_at timestamp NOT NULL,
    PRIMARY KEY (from_id, to_id)
);

ALTER TABLE channel_follows DROP CONSTRAINT IF EXISTS FK_channel_channelfollows;
ALTER TABLE channel_follows
    ADD CONSTRAINT FK_channel_channelfollows FOREIGN KEY (to_id) REFERENCES channel;

CREATE TABLE IF NOT EXISTS stream (
    id varchar(255),
    user_id varchar(255),
    user_login varchar(255),
    user_name varchar(255),
    game_id varchar(255),
    game_name varchar(255),
    title varchar(255),
    viewer_count bigint,
    started_at timestamp NOT NULL,
    language varchar
(255),
    PRIMARY KEY (id)
);

ALTER TABLE stream DROP CONSTRAINT IF EXISTS FK_channel_stream;
ALTER TABLE stream
    ADD CONSTRAINT FK_channel_stream FOREIGN KEY (user_id) REFERENCES channel;

CREATE TABLE IF NOT EXISTS stream_views (
    stream_id varchar(255),
    viewer_count bigint,
    datetime timestamp NOT NULL,
    PRIMARY KEY (stream_id, datetime)
);
ALTER TABLE stream_views DROP CONSTRAINT IF EXISTS FK_stream_views;
ALTER TABLE stream_views
    ADD CONSTRAINT FK_stream_views FOREIGN KEY (stream_id) REFERENCES stream;

CREATE TABLE IF NOT EXISTS clip (
    id varchar(255),
    url varchar(255),
    embed_url varchar(255),
    broadcaster_id varchar(255),
    broadcaster_name varchar(255),
    creator_id varchar(255),
    creator_name varchar(255),
    game_id varchar(255),
    language varchar
(255),
    title varchar(255),
    view_count bigint,
    created_at timestamp NOT NULL,
    thumbnail_url varchar(255),
    PRIMARY KEY (id)
);

ALTER TABLE clip DROP CONSTRAINT IF EXISTS FK_channel_clip;
ALTER TABLE clip
    ADD CONSTRAINT FK_channel_clip FOREIGN KEY (broadcaster_id) REFERENCES channel;

CREATE TABLE IF NOT EXISTS game (
    id varchar(255),
    name varchar(255),
    box_art_url varchar(255),
    PRIMARY KEY (id)
);

