import sqlite3
from sqlite3 import Error
import os


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        c = conn.cursor()
        #Lobby DB
        c.execute("CREATE TABLE IF NOT EXISTS lobbies ([lobby_id] INTEGER PRIMARY KEY, [lobby_name] TEXT, player1 INTEGER, player1_submission TEXT, player2 INTEGER, player2_submission TEXT, [game_state] TEXT)")
        c.execute("insert into lobbies (lobby_name) values ('lobby for newbs'), ('dave''s game'), ('csglompers'), ('long lobby name name name')")
        #Player DB
        c.execute("CREATE TABLE IF NOT EXISTS players ([player_id] INTEGER PRIMARY KEY, [player_name] TEXT UNIQUE, [password] TEXT)")
        c.execute("insert into players (player_name, password) values ('dave', '1234'), ('cam', '2345'), ('mark', '3456'), ('urk', '4567')")
        #Session DB
        c.execute("CREATE TABLE IF NOT EXISTS sessions ([session_id] INTEGER PRIMARY KEY, [player_id] INTEGER, [token_str] TEXT, [expiration] DATETIME, FOREIGN KEY(player_id) REFERENCES players(player_id))")
        c.execute("insert into sessions (player_id, token_str, expiration) values (1, '123456', '3000-01-01'), (2, '789101', '3000-01-01')")
        conn.commit()
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    # create_connection(f"{os.path.dirname(os.path.realpath(__file__))}/dist/server/db/db.sqlite3")
    create_connection("{}/dist/server/db/db.sqlite3".format(os.path.dirname(os.path.realpath(__file__))))
