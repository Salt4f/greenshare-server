CREATE TABLE Users (
    id INT PRIMARY KEY,
    email VARCHAR(127) UNIQUE NOT NULL,
    nickname VARCHAR(127) NOT NULL,
    dni VARCHAR(63),
    birthDate DATE,
    fullName VARCHAR(127),
    profilePicture VARCHAR(2083),
    aboutMe VARCHAR(255),
    banned BOOLEAN
)

CREATE TABLE Preferences (
    userID INT FOREIGN KEY REFERENCES Users(id),
    mobileNotification BOOLEAN,
    emailNotification BOOLEAN,
    locale VARCHAR(31)
)

CREATE TABLE BlockedUser (
    userOriginID INT FOREIGN KEY REFERENCES Users(id),
    userTargetID INT FOREIGN KEY REFERENCES Users(id),
    PRIMARY KEY (userOriginID, userTargetID)
)

