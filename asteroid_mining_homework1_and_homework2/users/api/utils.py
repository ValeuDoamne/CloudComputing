
def cleanup_db(*args):
    for c in args:
        c.close()
