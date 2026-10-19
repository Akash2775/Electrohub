#!/usr/bin/env python3
"""Create a local config without overwriting an existing one."""
from pathlib import Path
from getpass import getpass
import secrets
import os
root=Path(__file__).resolve().parent
p=root/'.env'
if p.exists():
 print('backend/.env already exists; preserved. Edit it to change your settings.')
 raise SystemExit(0)
email=input('Owner email: ').strip().lower()
if '@' not in email or '.' not in email.split('@')[-1]:raise SystemExit('Enter a valid owner email.')
password=getpass('Owner password (12-72 characters, blank = generate): ') or secrets.token_urlsafe(24)
if not 12<=len(password)<=72:raise SystemExit('Owner password must have 12-72 characters.')
db_password=getpass('MySQL password for the electrohub database user: ')
if not db_password:raise SystemExit('MySQL password is required.')
if any('\n' in x or '\r' in x for x in [email,password,db_password]):raise SystemExit('Values must be single-line.')
text=(root/'.env.example').read_text().replace('owner@example.com',email).replace('replace_with_a_unique_long_password',password).replace('replace_with_your_mysql_password',db_password)
p.write_text(text)
os.chmod(p,0o600)
print('Created backend/.env. The owner credentials are stored there. Add Razorpay keys there when ready. Do not share this file.')
