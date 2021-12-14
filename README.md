# home_automation
This is a home automation authentication web application using [node.js, htm, css, firebase_9, webpack]; and contains:
- firebase 9 modularity implementation
- bundling of src/dist

## user-modifications
one needs to add the firebase configuration at ./src/index.js line 21

## bundling and  deployment
- follow firebase bundling guide https://firebase.google.com/docs/web/module-bundling webpack is recommended
    - some webpack modules may be required as file loader, css loader
- either deployment or live-testing works fine as long as the firebase database is properly connected
- snapping the database is yet to be designed and produced
