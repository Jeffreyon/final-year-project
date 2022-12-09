Stashroom - A platform for finding and booking places to stay in school
=========

## Overview
This is a Nodejs project that was first authored by Jeffrey Onuigbo **jeffreyon11@gmail.com**, some services and core packages this project uses include:

[nodejs]*v12.16.1* - JavaScript runtime environment
[npm]*v6.13.4* - Package manager for the node ecosystem
[git]*2.25.1.windows.1* - Versioning system and source control
[express]*^v4.17.1* - JS server built on nodejs
[express-handlebars]*^v4.0.3* - Templating engine
[mongodb] - Schemaless document database
[mongoose]*^5.9.10* - Document object mapper for mongodb
[tailwindcss]*^1.2.0* - A utility first css library

## Goals of this project
This project was created out of the fustration that comes with getting affordable accomodation in tertiary institutions, some of the problems we are trying to solve include:

* Finding lodge rooms - The current procedure of finding a place to stay in school is going through lodge agents, these people are responsible for advertising, meeting prospective tenants, showing them the rooms and drawing a rental contract on behalf of  the landlord for a fee. This process entails contacting an agent, setting an appointment and setting a day to view the lodge, which may take not less that a week to process. We believe this experience can be made better and faster with technology, we have a database of lodges and rooms which the user can query using our search functionality to find and view lodge rooms faster and conviniently.

* View lodge rooms - Agents usually show potential tenants room pictures so they can get a view of what they are renting, they may obscure some details and even provide false details which can lead to unsatisfied and remorseful tenants, our platform provides images of every nook and cranny of the room, providing details even of the little things like power outlets and window proofing, providing useful info about the room, lodge, lodge rules and more without consulting an overeager agent.

* Price transparency - Going through agents is usually an expensive experience, agents charge an agent's fee that usually overpriced and may even increase the base rent thereby discouraging a lot of potential tenants from going through with renting the lodge, and usually the landlord or caretaker has no idea that this is going on. Our company provides an easy to register platform where a landlord can register his entire lodge or a subset of it's lodge rooms and set a price per room while we advertise the lodge to users who browse on our site.

* Refund anytime - More often than not, potential tenants are usually dissapointed by what they get after paying the rent and some agents may be unwilling to refund their money to them. Well in the unlikely case that a potential tenant doesn't like the room he can always cancel the booking and get a refund minus a percentage of the service fee.


## Project architecture
This project uses the MVC architecture for its organization

**Directory structure**
├── build/
├── controllers/
├── lib/
├── models/
├── public/
├── viewModels/
├── views/
├── .gitignore
├── app.js
├── dir.js
├── package-lock.json
├── package.json
├── populate.js
├── postcss.config.js
├── procfile
├── README.md
├── tailwind.config.js

[7] Directories, [10] Files

* build/ - Contains source builders for tailwindcss
* controllers/ - Route handlers for the express app
* lib/ - Utility modules
* models/ - Mongoose models for mongodb
* public/ - Client side files, includes css, js, multimedia, vendor files
* viewModels/ - Object mutators for views
* views/ - Handlebars views directory containing webpages, partials, layouts

* app.js - Entry point for the express app
* dir.js - Exports directory strings for development
* package-lock.json - npm packages
* package.json - Project's metadata
* populate.js - Populates the database with dummy data
* procfile - Heroku config file for deployment on heroku
