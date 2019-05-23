# Spotter

The frontend and backend for the Spotter app. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need a copy of yarn first of all; see the following link to get a copy of yarn up and running: https://yarnpkg.com/en/docs/install

Once you have yarn up, install a global copy of react-native:
```
yarn global add react-native-cli
```
Then, make sure you have a simulator to run the application, whether that be the Android or iOS emulator through their respective development environment installs: [Android Studio for Android](https://developer.android.com/studio/) or [XCode for iOS](https://developer.apple.com/xcode/).

### Installing

Clone the git
```
git clone https://<your username>@bitbucket.org/jn3141/spotter.git
```
Copy the .env file into the backend folder (which you will be able to retrieve from our shared Google Drive folder); this may be hidden to you if you're on a Mac, in which case hit the Cmd + Shift + . shortcut to toggle on hidden files.
If you don't have access to the .env file, then you will need to create a .env file with the following environment variables:

 - GOOGLE_CLIENT_ID: ID for the Google+ API; set up the API if necessary
 - GOOGLE_CLIENT_SECRET secret for the Google+ API; same as above for the GOOGLE_CLIENT_ID
 - GOOGLE_CALLBACK_URL: the URL for your version of the backend server; will need to be the /auth/google/callback for your server
 - GCM_KEY: key for Google Cloud Messaging; set up a Firebase account if necessary
 - JWT_SECRET: is the key for the JWT; this can be anything
 - MONGO_USER: user for the MongoDB; set up an mLab account for a MongoDB, and also update the URL in server.js if necessary
 - MONGO_PWD: password for the user for the MongoDB; same as above for MONGO_USER
 - PORT: the port the server will be running on; pick whichever one you have available

Run 'yarn' in the backend and frontend folders
```
cd backend
yarn
```
```
cd frontend
yarn
```

Open two terminals, one in frontend, and one in backend

In backend, run 'yarn dev'
```
cd backend
yarn dev
```

In frontend, run 'react-native run-ios/run-android' as necessary
```
cd frontend
react-native run-ios
```

## Deployment

For the backend, get a copy of [pm2](http://pm2.keymetrics.io/), and run the following command:
```
pm2 start backend/src/server.js
```

As for the frontend, you will want to update the .env.production for the frontend to match the URL for the backend in production.
Given that we don't have notifications on iOS, we will just want to build the Android version of the app. To do this, switch to the frontend folder, and run the following command:
```
react-native run-android --variant=release
```
The APK will be located in the base directory of the frontend.

## Built With

* [Node.js](https://nodejs.org/en/) - The backend framework

* [React Native](https://facebook.github.io/react-native/) - The frontend framework

## Contributing

When implementing new features, please branch and merge back into master afterwards.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Anyone we need to acknowledge?