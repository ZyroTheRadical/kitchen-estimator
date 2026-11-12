# Kitchen Estimator
A browser-based kitchen project estimator for Saskatchewan Kitchen Solutions. It guides visitors through product selection, kitchen customization, measurements, membership savings, and a final cost estimate.

The project is built with HTML, CSS, and vanilla JavaScript. It uses Bootstrap 5.3.3 for its responsive layout and interface components.
Features
- Six-step estimate wizard covering products, customization, measurements, membership, project review, and the final estimate.
- Multiple product selections: base cabinets, wall cabinets, and countertops.
- Customization options for cabinet colours, door styles, hardware types and finishes, and optional accessories.
- Measurements for linear footage, corner units, and sinks, with form validation.
- Three product lines: Empire Standard, Kitchen Elite, and Gold Star Plus, each with its own pricing multiplier.
- Membership discounts: Bronze (3%), Silver (5%), and Gold (7%).
- Optional costs such as delivery, installation, and a contingency allowance.
- Live estimate preview as project details are entered.
- Project saving and loading using the browser's local storage.
- Printable estimates and an option to copy estimate details to the clipboard.
- Responsive styling for desktop and smaller screens.

## Preview
There are no dedicated application screenshots included in the repository yet.

## Getting started
This is a static website. There is no package installation or build step.
1. Clone the repository
git clone https://github.com/ZyroTheRadical/kitchen-estimator.git
cd kitchen-estimator
2. Start a local web server
If Python 3 is installed, run:
`python -m http.server 8000`
3. Open the estimator

## Visit:

http://localhost:8000/estimator.html

You can also open estimator.html directly in a browser, but using a local server is recommended.
Using the estimator
1. Select one or more products: base cabinets, wall cabinets, and/or countertops.
2. Choose a product line.
3. Customize the available cabinet colours, door style, hardware, and accessories.
4. Enter the kitchen measurements, including linear footage and the number of corner units. Add sinks where applicable.
5. Select a membership level to see eligible savings.
6. Review the project details and build the estimate.
7. Print or copy the estimate. You can also save the project in the current browser and load it again later.
The Save my estimate feature stores information in the browser's local storage. Saved estimates are local to that browser and device; they are not uploaded to an account or server.

## Pricing notes
The estimator currently uses sample pricing values defined in order.js. These include product rates, product-line multipliers, membership discounts, hardware rates, delivery and installation costs, and GST/PST rates.

The generated estimate is preliminary. The displayed amounts are sample estimates and should not be treated as a final quote. Update the pricing rules in order.js if the rates or tax assumptions need to change.

## Project structure
````
kitchen-estimator/
├── estimator.html       # Main six-step kitchen project estimator
├── order.js             # Form logic, pricing calculations, saving/loading, and estimate output
├── style.css            # Main layout and visual styling
├── base.png             # Base cabinet product image
├── wall.png             # Wall cabinet product image
├── counters.png         # Countertop product image
├── index.html           # Simpler kitchen calculator page
├── script3.js           # JavaScript for the simpler calculator
├── emulator.html        # Earlier calculator/emulator page
├── script.js            # Empty placeholder file
└── kitchenemulator.html # Empty placeholder file
`````
The file list above reflects the project archive. The main application is estimator.html, which loads order.js and style.css.

## Technologies
- HTML5
- CSS3
- JavaScript (vanilla)
- Bootstrap 5.3.3 via CDN
A working internet connection is needed to load Bootstrap from its CDN.

## Browser support
Use a recent version of a modern browser such as Chrome, Firefox, Edge, or Safari. JavaScript must be enabled for the estimator and its interactive features to work.

## License
No license for this repository as it is a personal one for me

## Author
Created by @ZyroTheRadical 

Repository: ZyroTheRadical/kitchen-estimator
