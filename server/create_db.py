import sqlite3
from sqlite3 import Error
import os


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        c = conn.cursor()
        c.execute("CREATE TABLE IF NOT EXISTS lobbies ([lobby_id] INTEGER PRIMARY KEY, [lobby_name] TEXT, player1 INTEGER, player1_submission TEXT, player2 INTEGER, player2_submission TEXT, [game_state] TEXT)")
        c.execute("insert into lobbies (lobby_name) values ('lobby for newbs'), ('dave''s game'), ('csglompers'), ('long lobby name name name')")
        c.execute("CREATE TABLE IF NOT EXISTS players ([player_id] INTEGER PRIMARY KEY, [player_name] TEXT)")
        c.execute("insert into players (player_name) values ('dave'), ('cam'), ('mark'), ('urk')")
        conn.commit()
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    # create_connection(f"{os.path.dirname(os.path.realpath(__file__))}/dist/server/db/db.sqlite3")
    create_connection("{}/dist/server/db/db.sqlite3".format(os.path.dirname(os.path.realpath(__file__))))
