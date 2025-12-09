create table users
(
  id INTEGER PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

insert into users(firstName, lastName, email) values
  ('Mark', 'Watney', 'mark.watney@example.com'),
  ('David', 'Martens', 'david.martens@example.com'),
  ('Dustin', 'Dalke', 'dustin.dalke@example.com');