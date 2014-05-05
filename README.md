Node Datastore Server
=====================

This is a simple, minimal Node.js server demonstrating communication between the BodyTrack Grapher and the BodyTrack Datastore.  Not intended for use in production.

The BodyTrack Datastore repository is at:

    https://github.com/BodyTrack/datastore

The BodyTrack Grapher repository is at:

    https://github.com/BodyTrack/Grapher

This project includes binaries for the Grapher, but you'll need to
fetch and build the Datastore--see instructions below.

Installation And Setup
======================

Here's what to do to get the server running:

1. Fetch the BodyTrack Datastore:

        git clone https://github.com/BodyTrack/datastore.git

2. Follow the build and install instructions for the BodyTrack Datastore, but install it into this project's "datastore" directory.  This project's "datastore" directory should be the parent to the "datastore" and "db" subdirectories.

3. Install Node.js (http://nodejs.org/)

4. Open a terminal window and cd to this project's root directory

5. Install the dependences:

        npm install

6. Optionally install nodemon (https://github.com/remy/nodemon)

        npm install -g nodemon

7. Start the server:

        node app.js

   Or, if you installed nodemon, start it with:

        nodemon app.js

8. Open a brower and go to:

        http://localhost:3000/

You should see the server's home page with a message that the
datastore is empty.  See the "Uplaoding Data" section below for a
few different ways to get data in to the datastore.

Uploading Data
==============

This server supports uploading of new data.  Here are a few ways
to get data in:

1. For a quick test with some sample Speck data, find the db.tgz tarball in this project's etc directory and untar it into the datastore directory. OK, fine...so this isn't *uploading*, but it gets data in there so stop complaining.  :-)

2. To upload using curl, make sure the server is running, open a terminal with the current directory set to this project's root, and run the following:

        curl -H "Content-Type:application/json" http://localhost:3000/upload?dev_nickname=Speck -d @etc/speck_data.json

Doing that will get you the exact same data as what's in the db.tgz mentioned above.

3) If you're using the Speck Gateway (http://specksensor.org/), simply point the uploader at localhost:3000.  This server doesn't support multiple users (all data is stored under user ID 1), so the username and password required by uploader are ignored--set them to whatever you want.

Disclaimer
==========

This is my first time writing code for Node.js.  I probably did a lot
of things wrong and/or in a stupid way.  Feedback welcome.  Thanks.