import sqlite3
from sqlite3 import Error
import os


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        c = conn.cursor()
        c.execute("CREATE TABLE IF NOT EXISTS lobbies ([lobby_id] INTEGER PRIMARY KEY, [lobby_name] TEXT)")
        c.execute("insert into lobbies (lobby_name) values ('lobby for newbs'), ('dave''s game'), ('csglompers'), ('long lobby name name name')")
        conn.commit()
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    create_connection(f"{os.path.dirname(os.path.realpath(__file__))}\\db\\db.sqlite3")
