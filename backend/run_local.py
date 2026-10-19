#!/usr/bin/env python3
"""Load backend/.env without invoking a shell, then run Maven with Java 17+."""
import os, pathlib, subprocess, shutil, re, sys
root=pathlib.Path(__file__).resolve().parent
os.chdir(root)
env=os.environ.copy()
p=root/'.env'
if not p.exists():
 print('Create backend/.env from .env.example and enter MySQL + owner settings first.');sys.exit(1)
for line in p.read_text().splitlines():
 line=line.strip()
 if not line or line.startswith('#'):continue
 key,sep,value=line.partition('=')
 if sep:env[key.strip()]=value.strip().strip('"').strip("'")
if not shutil.which('mvn'):
 print('Maven not installed. Ubuntu: sudo apt install maven openjdk-17-jdk');sys.exit(1)
r=subprocess.run(['mvn','-version'],env=env,text=True,capture_output=True)
m=re.search(r'Java version: (\d+)',r.stdout)
if not m or int(m.group(1))<17:
 print('Maven needs Java 17 or newer. Check JAVA_HOME and mvn -version.');sys.exit(1)
try:sys.exit(subprocess.call(['mvn','spring-boot:run'],env=env))
except KeyboardInterrupt:sys.exit(130)
