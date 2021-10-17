CREATE TABLE Users (
    id INT PRIMARY KEY,
    email VARCHAR(127) UNIQUE NOT NULL,
    nickname VARCHAR(127) NOT NULL,
    dni VARCHAR(63),
    birthDate DATE,
    fullName VARCHAR(127),
    profilePicture LONGBLOB,
    aboutMe VARCHAR(255),
    banned BOOLEAN
);

CREATE TABLE Preferences (
    userID INT PRIMARY KEY,
    mobileNotification BOOLEAN,
    emailNotification BOOLEAN,
    locale VARCHAR(31),
    FOREIGN KEY (userID) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE BlockedUser (
    userOriginID INT,
    userTargetID INT,
    PRIMARY KEY (userOriginID, userTargetID),
    FOREIGN KEY (userOriginID) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (userTargetID) REFERENCES Users(id) ON DELETE CASCADE
);