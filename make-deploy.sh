#!/bin/sh
# Builds ./deploy = exactly what goes into Hostinger's public_html. config.php is NOT included (keep it one level above).
rm -rf deploy && mkdir deploy
cp index.html deploy/index.html
cp -r assets _ds *.js contact.php deploy/
rm deploy/dev-server.js
echo "Upload the contents of ./deploy to public_html. Put config.php (from config.example.php) one folder above it."
