CREATE TABLE Users (
    id INT PRIMARY KEY,
    email VARCHAR(127) UNIQUE NOT NULL,
    nickname VARCHAR(127) NOT NULL,
    dni VARCHAR(63)
)