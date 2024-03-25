from typing import List, Any, Dict, Tuple, Optional
from hashlib import sha512
from flask import Flask
from flask import jsonify, request
from flask.json import loads
import jwt
from os import getenv
import psycopg

from utils import cleanup_db

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = getenv("JWT_SECRET")

def get_db_conn() -> psycopg.Connection:
    db_conn = psycopg.connect(host=getenv("PGHOST"),
                              database=getenv("PGDATABASe"),
                              user=getenv("PGUSER"),
                              password=getenv("PGPASSWORD"), autocommit=True)
    return db_conn

def user_id_exists(cursor: psycopg.Cursor, user_id: int) -> bool:
    cursor.execute("SELECT id FROM users WHERE id=%b", (user_id,))
    result = cursor.fetchall()
    if len(result) == 0:
        return False
    return True

def get_user_type(cursor: psycopg.Cursor, user_type: int) -> Optional[str]:
    cursor.execute("SELECT type FROM user_types WHERE id=%b", (user_type,))
    result = cursor.fetchone()
    if result:
        return result[0]
    return None
    

def username_exists(cursor: psycopg.Cursor, username: str) -> bool:
    cursor.execute("SELECT username FROM users WHERE username=%s", (username,))
    result = cursor.fetchall()
    if len(result) == 0:
        return False
    return True

def error_without_key(body: Dict[str, any], keys: List[str]) -> Optional[Tuple[str, int]]:
    for key in keys:
        if key not in body:
            return jsonify(error=f"The key `{key}` is not present in the body"), 400
    return None


@app.route("/api/v1/register", methods=['POST'])
def register_user():
    connection = get_db_conn()
    cursor = connection.cursor() 
    data = request.get_json()

    if response := error_without_key(data, ['username', 'password']):
        cursor.close()
        connection.close()
        return response 
    
    username = data['username']
    password = data['password'].encode('utf-8')
    if username_exists(cursor, username) == True:
        cleanup_db(cursor, connection)
        return jsonify(error="Username already taken"), 400

    hashed_password = sha512(password).hexdigest()
    
    cursor.execute("INSERT INTO users(username, password, user_type) VALUES (%s, %s, (SELECT id FROM user_types WHERE type='astronaut')) RETURNING id", (username, hashed_password))
    result = cursor.fetchone()
    cleanup_db(cursor, connection)
    if result is not None:
        return jsonify(success=f"Successfully created user with id {result[0]}"), 200
    else:
        return jsonify(error=f"Could not create user"), 500

def check_login(cursor: psycopg.Cursor, username: str, password: str):
    cursor.execute("SELECT id FROM users WHERE username=%s AND password=%s", (username, password))
    result = cursor.fetchall()

@app.route("/api/v1/login", methods=['POST'])
def login_user():
    connection = get_db_conn()
    cursor = connection.cursor() 
    data = request.get_json()

    if response := error_without_key(data, ['username', 'password']):
        cursor.close()
        connection.close()
        return response 
    
    username = data['username']
    password = data['password'].encode('utf-8')
    hashed_password = sha512(password).hexdigest()

    cursor.execute("SELECT id,user_type FROM users WHERE username=%s AND password=%s", (username, hashed_password))
    result = cursor.fetchone()
    cleanup_db(cursor, connection)
    if result is not None:
        jwt_token = jwt.encode({"user_id": result[0], "user_type": result[1]}, app.config['JWT_SECRET_KEY'], algorithm='HS512')
        cleanup_db(cursor, connection)
        return jsonify(success=f"Successfully logged in", token=jwt_token), 200

    cleanup_db(cursor, connection)
    return jsonify(error=f"Could not login user"), 500

@app.route("/api/v1/valid_jwt", methods=['GET'])
def check_valid_jwt():
    jwt_token = request.args.get('jwt')
    try:
        decoded_jwt = jwt.decode(jwt_token, key=app.config['JWT_SECRET_KEY'], verify=True, algorithms='HS512')
    except jwt.exceptions.DecodeError:
        return jsonify(error="The JWT provided is invalid"), 400
    except:
        return jsonify(error="Errors at decoding the JWT"), 500

    if response := error_without_key(decoded_jwt, ["user_id", "user_type"]):
        return response

    user_id = decoded_jwt["user_id"]
    user_type = decoded_jwt["user_type"]
    connection = get_db_conn()
    cursor = connection.cursor() 
    if user_id_exists(cursor, user_id):
        user_type_str = get_user_type(cursor, user_type)
        cleanup_db(cursor, connection)
        return jsonify(success="JWT is valid", user_type=user_type_str)
    else:
        cleanup_db(cursor, connection)
        return jsonify(error="JWT is not valid, the user does not exists"), 401

@app.route("/")
def hello():
    connection = get_db_conn()
    cursor = connection.cursor() 
    cursor.execute("SELECT * FROM user_types")
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    return f"<h1>{result}</h1>"

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
