(() => {
    // Cache the page elements we use repeatedly so the estimator can update the UI without re-querying the DOM each time.
    // The data-* attributes are used to identify elements that are part of the estimator UI, while the IDs and names are used to access form controls.
    // The querySelector and querySelectorAll methods are used to select elements based on their attributes, while getElementById is used to select elements by their ID.
    // The Array.from method is used to convert NodeLists to arrays for easier manipulation.
    // The form elements are accessed using the form.elements property, which provides a collection of all form controls.
    // The estimateRules object contains the pricing model, membership discounts, and tax settings, which are used to calculate the estimate consistently.
    // The calculateEstimate function computes the full kitchen estimate based on the selected products, measurements, and optional add-ons.
    const currentYear = document.querySelector("[data-current-year]");
    currentYear.dateTime = String(new Date().getFullYear());
    currentYear.textContent = currentYear.dateTime;

    const form = document.getElementById("productForm");
    const productImage = document.getElementById("productImage");
    const membershipLevel = document.getElementById("membershipLevel");
    const sinkField = document.getElementById("sinkField");
    const sinkInput = form.elements.sinks;

    // Cache the error message elements for the corner units and sinks inputs, as well as the product dropdown and summary elements.
    // These elements are used to provide feedback to the user when the inputs are invalid or when no products are selected.
    // The productError element is used to display an error message when the user attempts to proceed without selecting any products.
    // The productSelectionNote element provides additional guidance to the user about selecting products.
    // The membershipFeedback element displays information about the selected membership level and the associated savings.
    // The footageInput and footageError elements are used to validate the linear footage input and provide feedback to the user.
    // The cabinetCustomization element contains the inputs for selecting cabinet styles and hardware options, which are enabled or disabled based on the selected products.
    // The doorStyleInputs array contains the inputs for selecting cabinet door styles, which are enabled or disabled based on the selected products.
    // The hardwareType and hardwareFinish elements are used to select the type and finish of cabinet hardware, which are enabled or disabled based on the selected products.
    // The wizardSteps array contains the sections of the form that correspond to each step of the wizard, which are shown or hidden based on the current step.
    // The progressSteps array contains the elements that indicate the user's progress through the wizard, which are updated based on the current step.
    // The stepCount and stepTitle elements display the current step number and title, which are updated based on the current step.
    const cornerInput = form.elements.cornerUnits;
    const cornerError = document.getElementById("cornerUnitsError");
    const sinkError = document.getElementById("sinksError");
    const productDropdown = document.getElementById("productDropdown");
    const productSummary = form.querySelector("[data-product-summary]");
    const productError = form.querySelector("[data-product-error]");

    const productSelectionNote = document.getElementById("productSelectionNote");
    const membershipFeedback = document.getElementById("membershipFeedback");
    const footageInput = form.elements.linearFt;
    const footageError = document.getElementById("linearFtError");
    const cabinetCustomization = document.getElementById("cabinetCustomization");
    const doorStyleInputs = Array.from(form.querySelectorAll("[name='doorStyle']"));
    const hardwareType = form.elements.hardwareType;
    const hardwareFinish = form.elements.hardwareFinish;
    const wizardSteps = Array.from(form.querySelectorAll("[data-wizard-step]"));

    // Cache the elements that display the review of the user's selections and the live and preview totals.
    // These elements are updated whenever the form state changes to provide the user with a summary of their selections and the estimated total cost.
    // The reviewProducts, reviewLine, reviewColors, reviewSpace, reviewMembership, reviewInstallation, and reviewCostOptions elements display the selected products, collection line, cabinet colors, space measurements, membership level, installation preference, and optional costs, respectively.
    // The liveTotal and previewTotal elements display the estimated total cost based on the user's selections, which is updated whenever the form state changes.
    // The previewSelection element displays a summary of the selected products in a compact format for quick reference.
    // The result element is created to display the detailed estimate breakdown, which is updated whenever the user requests an estimate.
    // The estimateRequested variable tracks whether the user has requested an estimate, which is used to determine whether to display the estimate breakdown.
    // The estimateRules object contains the pricing model, membership discounts, and tax settings, which are used to calculate the estimate consistently.
    // The selectedProductTypes function returns an array of the selected product types based on the user's selections in the form.
    // The calculateEstimate function computes the full kitchen estimate based on the selected products, measurements, and optional add-ons, returning an object containing all relevant cost breakdowns.
    // The updateMembershipFeedback function updates the membership feedback message and the total savings display based on the selected membership level and the current estimate.
    

    const progressSteps = Array.from(form.querySelectorAll("[data-progress-step]"));
    const stepCount = document.querySelector("[data-step-count]");
    const stepTitle = document.querySelector("[data-step-title]");
    const estimatorHeading = document.querySelector(".estimator-heading");
    const nextButton = form.querySelector("[data-step-next]");
    const backButton = form.querySelector("[data-step-back]");
    const buildButton = form.querySelector("[data-build-estimate]");
    const saveButton = form.querySelector("[data-save-project]");
    const loadButton = form.querySelector("[data-load-project]");
    const saveStatus = form.querySelector("[data-save-status]");
    const reviewProducts = form.querySelector("[data-review-products]");


    const reviewLine = form.querySelector("[data-review-line]");
    const reviewColors = form.querySelector("[data-review-colors]");
    const reviewSpace = form.querySelector("[data-review-space]");
    const reviewMembership = form.querySelector("[data-review-membership]");
    const reviewInstallation = form.querySelector("[data-review-installation]");
    const reviewCostOptions = form.querySelector("[data-review-cost-options]");

    const reviewStyle = form.querySelector("[data-review-style]");
    const reviewHardware = form.querySelector("[data-review-hardware]");
    const reviewAccessories = form.querySelector("[data-review-accessories]");
    const liveTotal = form.querySelector("[data-live-total]");
    const previewTotal = form.querySelector("[data-preview-total]");
    const previewSelection = form.querySelector("[data-preview-selection]");
    const result = document.createElement("section");
    result.setAttribute("aria-live", "polite");
    result.setAttribute("tabindex", "-1");
    form.after(result);
    let estimateRequested = false;

    // Keep the pricing model, membership discounts, and tax settings in one place so the estimate can be updated consistently.
    const estimateRules = {
        products: {
            "Base Cabinets": { rate: 250, image: "base.png" },
            "Wall Cabinets": { rate: 200, image: "wall.png" },
            "Counter Tops": { rate: 150, image: "counters.png" }
        },
        collectionMultipliers: {
            "Empire Standard": 1,
            "Kitchen Elite": 1.8,
            "Gold Star Plus": 2.5
        },
        cornerUnitRate: 250,
        sinkRate: 250,
        taxes: [
            { name: "GST", rate: 0.05 },
            { name: "PST", rate: 0.06 }
        ],
        membershipDiscounts: {
            Bronze: 0.03,
            Silver: 0.05,
            Gold: 0.07
        },
        hardwareRates: {
            Handles: 12,
            Knobs: 8
        },
        additionalCosts: {
            delivery: 149,
            installation: 899,
            contingencyRate: 0.10
        },
        savedProjectKey: "saskatchewan-kitchen-solutions.saved-estimate"
    };
    const { products, collectionMultipliers, membershipDiscounts, hardwareRates } = estimateRules;
    let productSelectionAttempted = false;
    let currentStep = 1;
    const stepTitles = wizardSteps.map((step) => step.querySelector("h3").textContent.trim());

    const money = (amount) => new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        currencyDisplay: "code"
    }).format(amount);
    const cents = (amount) => Math.round(amount * 100) / 100;
    for (const input of form.querySelectorAll("[data-accessory-price]")) {
        input.closest(".accessory-option")
            .querySelector("[data-accessory-price-display]").textContent =
            money(Number(input.dataset.accessoryPrice));
    }

    const selectedProductTypes = () =>
        Array.from(form.querySelectorAll("[data-product-value][aria-pressed='true']"),
            (button) => button.dataset.productValue);

    // Build the full kitchen estimate from the selected products, measurements, and optional add-ons.
    const calculateEstimate = () => {
        const selectedProducts = selectedProductTypes();
        const line = form.elements.productLine.value;
        const footage = Number(footageInput.value);
        const corners = Number(cornerInput.value);
        const sinks = sinkInput.disabled ? 0 : Number(sinkInput.value);
        const productCosts = selectedProducts.map((product) => ({
            product,
            color: product === "Base Cabinets" ? form.elements.baseCabinetColor.value
                : product === "Wall Cabinets" ? form.elements.wallCabinetColor.value : "",
            cost: cents(footage * products[product].rate)
        }));

        const productCost = productCosts.reduce((total, item) => total + item.cost, 0);
        const cabinetryCost = productCosts
            .filter(({ product }) => product === "Base Cabinets" || product === "Wall Cabinets")
            .reduce((total, item) => total + item.cost, 0);
        const cornerCost = cents(corners * estimateRules.cornerUnitRate);
        const sinkCost = cents(sinks * estimateRules.sinkRate);
        const hardwareCost = hardwareType.value
            ? cents(footage * hardwareRates[hardwareType.value])
            : 0;

        const accessories = Array.from(form.querySelectorAll("[name='accessories']:checked"),
            (input) => ({ name: input.value, cost: Number(input.dataset.accessoryPrice) }));
        const accessoryCost = accessories.reduce((total, accessory) => total + accessory.cost, 0);
        const baseSubtotal = cents(productCost + cornerCost + sinkCost + hardwareCost + accessoryCost);
        const originalSubtotal = cents(baseSubtotal * (collectionMultipliers[line] || 1));
        const lineAdjustment = cents(originalSubtotal - baseSubtotal);
        const discountRate = membershipDiscounts[membershipLevel.value] || 0;
        const deliveryCost = form.elements.includeDelivery.checked
            ? estimateRules.additionalCosts.delivery : 0;
        const installationPreference = form.elements.installationPreference.value;
        const fullInstallationCost = installationPreference === "Supply and installation"
            ? estimateRules.additionalCosts.installation : 0;
        const eligibleCabinetrySubtotal = cents(cabinetryCost * (collectionMultipliers[line] || 1));
        const cabinetryDiscount = cents(eligibleCabinetrySubtotal * discountRate);
        const installationDiscount = cents(fullInstallationCost * discountRate);
        const discount = cents(cabinetryDiscount + installationDiscount);
        const subtotal = cents(originalSubtotal - cabinetryDiscount);
        const installationCost = cents(fullInstallationCost - installationDiscount);
        const contingencyBase = cents(subtotal + deliveryCost + installationCost);
        const contingencyCost = form.elements.includeContingency.checked
            ? cents(contingencyBase * estimateRules.additionalCosts.contingencyRate) : 0;
        const taxableSubtotal = cents(subtotal + deliveryCost + installationCost + contingencyCost);
        const taxes = estimateRules.taxes.map(({ name, rate }) => ({
            name,
            rate,
            amount: cents(taxableSubtotal * rate)
        }));
        const completeTotal = cents(taxableSubtotal + taxes.reduce((sum, tax) => sum + tax.amount, 0));

        return {
            selectedProducts,
            line,
            footage,
            corners,
            sinks,
            productCosts,
            cornerCost,
            sinkCost,
            hardwareCost,
            accessories,
            accessoryCost,
            lineAdjustment,
            originalSubtotal,
            eligibleCabinetrySubtotal,
            discountRate,
            cabinetryDiscount,
            discount,
            subtotal,
            deliveryCost,
            installationPreference,
            fullInstallationCost,
            installationDiscount,
            installationCost,
            contingencyCost,
            taxableSubtotal,
            taxes,
            total: completeTotal
        };
    };
    // Update the membership summary and savings text shown under the pricing cards.
    // This function highlights the selected tier, calculates the projected savings for each level,
    // and tells the user whether a membership is active and what discount is unlocked.
    const updateMembershipFeedback = () => {
        const selectedLevel = membershipLevel.value;
        for (const card of form.querySelectorAll("[data-membership-card]")) {
            card.classList.toggle("is-selected", card.dataset.membershipCard === selectedLevel);
        }
        const pricingInputsComplete = selectedProductTypes().length > 0
            && Boolean(footageInput.value)
            && Boolean(cornerInput.value)
            && footageInput.checkValidity()
            && cornerInput.checkValidity()
            && (sinkInput.disabled || sinkInput.checkValidity())
            && Boolean(form.elements.productLine.value);
        const originalSubtotalOutput = form.querySelector("[data-original-subtotal]");
        const totalSavingsOutput = form.querySelector("[data-total-savings]");
        const totalSavingsLabel = form.querySelector("[data-total-savings-label]");

        if (pricingInputsComplete) {
            const estimate = calculateEstimate();
            const fullInstallationCost = estimate.fullInstallationCost;
            originalSubtotalOutput.textContent = money(estimate.originalSubtotal);
            for (const [level, rate] of Object.entries(membershipDiscounts)) {
                form.querySelector(`[data-tier-discount="${level}"]`).textContent =
                    `${money(cents(estimate.eligibleCabinetrySubtotal * rate)
                        + cents(fullInstallationCost * rate))} saved`;
            }
            totalSavingsOutput.textContent = money(estimate.discount);
        } else {
            originalSubtotalOutput.textContent = "Complete products and measurements to see your subtotal.";
            for (const level of Object.keys(membershipDiscounts)) {
                form.querySelector(`[data-tier-discount="${level}"]`).textContent = "—";
            }
            totalSavingsOutput.textContent = "—";
        }
        totalSavingsLabel.textContent = selectedLevel
            ? `Total savings (${selectedLevel} selected)`
            : "Total savings (no membership)";

        if (!selectedLevel) {
            membershipFeedback.textContent = "Choose a membership to unlock a savings tier.";
            membershipFeedback.classList.remove("is-active");
            return;
        }

        const discountRate = membershipDiscounts[selectedLevel];
        membershipFeedback.textContent =
            `${selectedLevel} Membership active: save ${Math.round(discountRate * 100)}% on eligible cabinetry and included installation.`;
        membershipFeedback.classList.add("is-active");
    };
    // Validate the linear footage input and provide feedback to the user if the value is out of range.
    // The min and max values are set in the HTML to match the pricing model.
    // The validation message is updated dynamically to reflect the current min and max values.
    // The aria-invalid attribute is updated to reflect the validity state of the input for screen readers.
    // The error message is displayed in a visually hidden element for screen readers and visible to sighted users.
    // The validation is triggered on input and change events to provide immediate feedback to the user.
    // The validation is also triggered on form submission to prevent the form from being submitted with invalid values.
    const updateFootageValidation = () => {
        const footage = Number(footageInput.value);
        const minimum = Number(footageInput.min);
        const maximum = Number(footageInput.max);
        let message = "";
        if (footageInput.value !== "" && footage < minimum) {
            message = `Please enter at least ${minimum} linear feet.`;
        } else if (footageInput.value !== "" && footage > maximum) {
            message = `Please enter no more than ${maximum} linear feet.`;
        }
        footageInput.setCustomValidity(message);
        footageInput.setAttribute("aria-invalid", message ? "true" : "false");
        footageError.textContent = message;
        footageError.hidden = !message;
    };

    // Validate numeric form fields that must stay within a minimum and maximum range.
    // The function is reused for corner units and sinks so the same error handling logic works for multiple inputs.
    const updateCountValidation = (input, error, label, disabled = false) => {
        let message = "";
        const value = Number(input.value);

        if (!disabled && input.value !== "" && value < Number(input.min)) {
            message = `Please enter at least ${input.min} ${label}.`;
        } else if (!disabled && input.value !== "" && value > Number(input.max)) {
            message = `Please enter no more than ${input.max} ${label}.`;
        }

        input.setCustomValidity(message);
        input.setAttribute("aria-invalid", message ? "true" : "false");
        error.textContent = message;
        error.hidden = !message;
    };

    // Refresh the summary panel whenever the form state changes so the user always sees the latest estimate snapshot.
    const updateReview = () => {
        const selectedProducts = selectedProductTypes();
        const selectedLine = form.elements.productLine.value;
        const colors = selectedProducts
            .filter((product) => product !== "Counter Tops")
            .map((product) => {
                const colorInput = product === "Base Cabinets"
                    ? form.elements.baseCabinetColor : form.elements.wallCabinetColor;
                return colorInput.value ? `${product}: ${colorInput.value}` : "";
            })
            .filter(Boolean);
        reviewProducts.textContent = selectedProducts.length ? selectedProducts.join(", ") : "No products selected";
        previewSelection.textContent = selectedProducts.length
            ? selectedProducts.join(" · ")
            : "No products selected";
        reviewLine.textContent = selectedLine || "No collection selected";
        reviewColors.textContent = colors.length ? colors.join(" · ") : "No cabinet finishes selected";
        const selectedDoorStyle = form.elements.doorStyle.value;
        reviewStyle.textContent = selectedDoorStyle || "No cabinet style selected";
        reviewHardware.textContent = hardwareType.value
            ? `${hardwareType.value} · ${hardwareFinish.value} (${money(hardwareRates[hardwareType.value] * Number(footageInput.value))} sample)`
            : "No hardware selected";
        const selectedAccessories = Array.from(form.querySelectorAll("[name='accessories']:checked"),
            (input) => input.value);
        reviewAccessories.textContent = selectedAccessories.length
            ? selectedAccessories.join(", ")
            : "None selected";
        const footage = footageInput.value ? `${footageInput.value} linear ft` : "Footage not entered";
        const cornerCount = Number(cornerInput.value);
        const corners = cornerInput.value
            ? `${cornerCount} ${cornerCount === 1 ? "corner unit" : "corner units"}`
            : "Corner units not entered";
        const sinks = sinkInput.disabled
            ? "Sinks not applicable"
            : sinkInput.value
                ? `${sinkInput.value} ${Number(sinkInput.value) === 1 ? "sink" : "sinks"}`
                : "No sinks added";
        reviewSpace.textContent = `${footage} · ${corners} · ${sinks}`;
        const estimate = calculateEstimate();
        reviewMembership.textContent = membershipLevel.value
            ? `${membershipLevel.value} Membership (${Math.round(membershipDiscounts[membershipLevel.value] * 100)}% savings · ${money(estimate.discount)})`
            : "No membership";
        reviewInstallation.textContent =
            form.elements.installationPreference.value || "No preference selected";
        const selectedCostOptions = [];
        if (estimate.deliveryCost > 0) selectedCostOptions.push(`Delivery ${money(estimate.deliveryCost)}`);
        if (estimate.installationCost > 0) selectedCostOptions.push(`Installation ${money(estimate.installationCost)}`);
        if (estimate.contingencyCost > 0) selectedCostOptions.push(`Contingency ${money(estimate.contingencyCost)}`);
        reviewCostOptions.textContent = selectedCostOptions.length
            ? selectedCostOptions.join(" · ")
            : "No optional costs selected";
        const estimateReady = selectedProducts.length > 0 && form.checkValidity();
        liveTotal.textContent = estimateReady
            ? money(estimate.total)
            : "Complete the required choices to see your estimate.";
        previewTotal.textContent = estimateReady
            ? money(estimate.total)
            : "Complete the required details to see your estimate.";
        previewTotal.classList.toggle("is-pending", !estimateReady);
    };
    // Show one step of the wizard, hide the others, and update the progress indicators.
    // This keeps the estimator flow linear while still allowing the user to edit previous sections.
    const showStep = (step, moveFocus = false) => {
        currentStep = step;
        for (const section of wizardSteps) {
            section.hidden = Number(section.dataset.wizardStep) !== step;
        }
        for (const item of progressSteps) {
            const itemStep = Number(item.dataset.progressStep);
            item.classList.toggle("is-current", itemStep === step);
            item.classList.toggle("is-complete", itemStep < step);
            if (itemStep === step) {
                item.setAttribute("aria-current", "step");
            } else {
                item.removeAttribute("aria-current");
            }
        }

        stepCount.textContent = `${String(step).padStart(2, "0")} — ${String(wizardSteps.length).padStart(2, "0")}`;
        stepTitle.textContent = stepTitles[step - 1];
        estimatorHeading.style.setProperty("--step-progress", `${(step / wizardSteps.length) * 100}%`);
        backButton.hidden = step === 1;
        nextButton.hidden = step === wizardSteps.length;
        buildButton.hidden = step !== wizardSteps.length;
        updateReview();
        if (step === wizardSteps.length) updateEstimateIfValid();

        if (moveFocus) {
            wizardSteps[step - 1].querySelector("h3").focus();
        }
    };

    // Toggle the visible cabinet settings based on the product selections.
    // This function enables the relevant color, style, hardware, and sink fields and hides the ones that are not needed.
    const updateProductOptions = () => {
        const selectedProducts = selectedProductTypes();
        const selectedProductSet = new Set(selectedProducts);
        productSummary.textContent = selectedProducts.length
            ? `${selectedProducts.length} ${selectedProducts.length === 1 ? "item" : "items"} selected`
            : "Select products to include";
        productSelectionNote.textContent = selectedProducts.length
            ? `Selected: ${selectedProducts.join(" • ")}. You can still refine your finish choices.`
            : "Select all the items you want included.";
        productDropdown.classList.toggle("has-selection", selectedProducts.length > 0);
        productDropdown.classList.toggle("has-error", productSelectionAttempted && selectedProducts.length === 0);
        productSummary.setAttribute("aria-invalid",
            productSelectionAttempted && selectedProducts.length === 0 ? "true" : "false");
        productError.hidden = !productSelectionAttempted || selectedProducts.length > 0;
        const bothCabinetTypesSelected =
            selectedProductSet.has("Base Cabinets") && selectedProductSet.has("Wall Cabinets");
        const hasCabinets = selectedProductSet.has("Base Cabinets") || selectedProductSet.has("Wall Cabinets");

        for (const [product, fieldName] of [
            ["Base Cabinets", "baseCabinetColor"],
            ["Wall Cabinets", "wallCabinetColor"]
        ]) {
            const field = form.querySelector(`[data-color-field="${product}"]`);
            const colorInput = form.elements[fieldName];
            const isSelected = selectedProductSet.has(product);
            field.hidden = !isSelected;
            colorInput.disabled = !isSelected;
            colorInput.required = isSelected;
        }

        cabinetCustomization.hidden = !hasCabinets;
        for (const input of doorStyleInputs) {
            input.disabled = !hasCabinets;
            input.required = hasCabinets;
        }
        hardwareType.disabled = !hasCabinets;
        hardwareType.required = hasCabinets;
        hardwareFinish.disabled = !hasCabinets || !hardwareType.value;
        hardwareFinish.required = hasCabinets && Boolean(hardwareType.value);

        sinkField.hidden = bothCabinetTypesSelected;
        sinkInput.disabled = bothCabinetTypesSelected;
        if (bothCabinetTypesSelected) sinkInput.value = "";
        updateCountValidation(sinkInput, sinkError, "sinks", bothCabinetTypesSelected);

        if (selectedProducts.length === 0) {
            productImage.hidden = true;
            productImage.removeAttribute("src");
            productImage.alt = "";
            return;
        }

        const previewProduct = products[selectedProducts[0]];
        productImage.src = previewProduct.image;
        productImage.alt = `${selectedProducts.join(" and ")} example`;
        productImage.hidden = false;
    };

    // Render the detailed estimate table after the user has completed enough form fields to generate a valid quote.
    // This builds the final breakdown with product rows, taxes, optional fees, and the grand total.
    const updateEstimate = () => {
        const estimate = calculateEstimate();
        const {
            line, footage, corners, sinks, productCosts, cornerCost, sinkCost,
            hardwareCost, accessories, lineAdjustment, originalSubtotal,
            cabinetryDiscount,
            subtotal, deliveryCost, installationPreference, installationCost,
            installationDiscount, contingencyCost, taxableSubtotal, taxes, total
        } = estimate;

        result.innerHTML = `
            <div class="card shadow-sm mt-4">
                <div class="card-header bg-light">
                    <h2 class="h4 mb-1">Kitchen Renovation Estimate</h2>
                    <p class="mb-0 text-secondary" data-date></p>
                </div>
                <div class="card-body">
                    <table class="table">
                        <tbody data-product-rows></tbody>
                        <tbody>
                            <tr><th data-corner-label></th><td data-corner-cost></td></tr>
                            <tr><th data-sink-label></th><td data-sink-cost></td></tr>
                            <tr data-hardware-row hidden><th data-hardware-label></th><td data-hardware-cost></td></tr>
                        </tbody>
                        <tbody data-accessory-rows></tbody>
                        <tbody>
                            <tr><th data-line></th><td data-line-adjustment></td></tr>
                            <tr><th>Original subtotal (before membership)</th><td data-original-subtotal></td></tr>
                            <tr><th>Bronze savings on eligible cabinetry and installation (3%)</th><td data-tier-discount="Bronze"></td></tr>
                            <tr><th>Silver savings on eligible cabinetry and installation (5%)</th><td data-tier-discount="Silver"></td></tr>
                            <tr><th>Gold savings on eligible cabinetry and installation (7%)</th><td data-tier-discount="Gold"></td></tr>
                            <tr><th data-discount-label></th><td data-discount></td></tr>
                            <tr><th data-subtotal-label>Subtotal after cabinetry discount</th><td data-subtotal></td></tr>
                            <tr><th data-delivery-label></th><td data-delivery-cost></td></tr>
                            <tr><th data-installation-label></th><td data-installation-cost></td></tr>
                            <tr><th data-contingency-label></th><td data-contingency-cost></td></tr>
                            <tr><th>Subtotal including selected costs (before tax)</th><td data-taxable-subtotal></td></tr>
                        </tbody>
                        <tbody data-tax-rows></tbody>
                        <tbody>
                            <tr class="table-light"><th>Total</th><td class="fw-bold" data-total></td></tr>
                        </tbody>
                    </table>
                    <div class="estimate-actions">
                        <p class="small text-secondary mb-0" data-action-status role="status"></p>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn estimate-action-button" data-copy-estimate>Copy estimate</button>
                            <button type="button" class="btn estimate-action-button" data-print-estimate>Print / save PDF</button>
                        </div>
                    </div>
                    <p class="small text-secondary mb-0">
                        Sample-rate estimate in CAD. Optional delivery and contingency are excluded unless selected.
                        The $899 installation fee is included only for supply and installation. Taxes are estimated
                        on the subtotal including selected fees and allowances.
                    </p>
                </div>
            </div>`;

        result.querySelector("[data-date]").textContent = new Date().toDateString();
        const productRows = result.querySelector("[data-product-rows]");
        for (const item of productCosts) {
            const row = document.createElement("tr");
            const label = document.createElement("th");
            const cost = document.createElement("td");
            label.textContent = `${item.product}${item.color ? ` — ${item.color}` : ""} (${footage} ft)`;
            cost.textContent = money(item.cost);
            row.append(label, cost);
            productRows.append(row);
        }
        result.querySelector("[data-corner-label]").textContent = `Corner Units (${corners})`;
        result.querySelector("[data-corner-cost]").textContent = money(cornerCost);
        const sinkRow = result.querySelector("[data-sink-label]").closest("tr");
        sinkRow.hidden = sinkInput.disabled;
        if (!sinkInput.disabled) {
            result.querySelector("[data-sink-label]").textContent = `Sinks (${sinks})`;
            result.querySelector("[data-sink-cost]").textContent = money(sinkCost);
        }
        const hardwareRow = result.querySelector("[data-hardware-row]");
        hardwareRow.hidden = hardwareCost === 0;
        if (hardwareCost > 0) {
            result.querySelector("[data-hardware-label]").textContent =
                `${hardwareType.value} (${footage} ft × ${money(hardwareRates[hardwareType.value])} per ft)`;
            result.querySelector("[data-hardware-cost]").textContent = money(hardwareCost);
        }
        const accessoryRows = result.querySelector("[data-accessory-rows]");
        for (const accessory of accessories) {
            const row = document.createElement("tr");
            const label = document.createElement("th");
            const cost = document.createElement("td");
            label.textContent = accessory.name;
            cost.textContent = money(accessory.cost);
            row.append(label, cost);
            accessoryRows.append(row);
        }
        result.querySelector("[data-line]").textContent =
            `Collection adjustment (${line}, x${collectionMultipliers[line]})`;
        result.querySelector("[data-line-adjustment]").textContent = money(lineAdjustment);
        result.querySelector("[data-original-subtotal]").textContent = money(originalSubtotal);
        for (const [level, rate] of Object.entries(membershipDiscounts)) {
            result.querySelector(`[data-tier-discount="${level}"]`).textContent =
                money(cents(estimate.eligibleCabinetrySubtotal * rate)
                    + cents(estimate.fullInstallationCost * rate));
        }
        result.querySelector("[data-discount-label]").textContent = membershipLevel.value
            ? `Cabinetry savings (${membershipLevel.value} membership selected)`
            : "Cabinetry savings (no membership selected)";
        result.querySelector("[data-discount]").textContent = cabinetryDiscount > 0
            ? `-${money(cabinetryDiscount)}` : money(0);
        result.querySelector("[data-subtotal]").textContent = money(subtotal);
        result.querySelector("[data-delivery-label]").textContent = deliveryCost > 0
            ? "Delivery fee (included)"
            : "Delivery fee (optional, not included)";
        result.querySelector("[data-delivery-cost]").textContent = deliveryCost > 0
            ? money(deliveryCost) : "Not included";
        result.querySelector("[data-installation-label]").textContent = installationCost > 0
            ? `Installation fee (included${installationDiscount > 0
                ? ` after ${money(installationDiscount)} membership savings` : ""} — ${installationPreference})`
            : `Installation fee (not included — ${installationPreference})`;
        result.querySelector("[data-installation-cost]").textContent = installationCost > 0
            ? money(installationCost) : "Not included";
        result.querySelector("[data-contingency-label]").textContent = contingencyCost > 0
            ? "10% contingency allowance (included)"
            : "10% contingency allowance (optional, not included)";
        result.querySelector("[data-contingency-cost]").textContent = contingencyCost > 0
            ? money(contingencyCost) : "Not included";
        result.querySelector("[data-taxable-subtotal]").textContent = money(taxableSubtotal);
        const taxRows = result.querySelector("[data-tax-rows]");
        for (const tax of taxes) {
            const row = document.createElement("tr");
            const label = document.createElement("th");
            const amount = document.createElement("td");
            label.textContent = `${tax.name === "PST" ? "Saskatchewan PST" : tax.name} (${tax.rate * 100}%)`;
            amount.textContent = money(tax.amount);
            row.append(label, amount);
            taxRows.append(row);
        }
        result.querySelector("[data-total]").textContent = money(total);
    };

    // Only render the detailed estimate when the estimator has enough valid input to support a real quote.
    // If the form is incomplete or invalid, the previous estimate is cleared so the UI does not show stale pricing.
    const updateEstimateIfValid = () => {
        const isValid = selectedProductTypes().length > 0 && form.checkValidity();
        if (estimateRequested && isValid) {
            updateEstimate();
        } else if (result.childElementCount > 0) {
            result.replaceChildren();
        }
    };

    // Validate the current wizard step before moving forward.
    // If the step is the product selection step, it must have at least one item selected; otherwise it is blocked.
    const validateStep = (step) => {
        if (step === 1) {
            productSelectionAttempted = true;
            updateProductOptions();
            if (selectedProductTypes().length === 0) {
                productDropdown.querySelector("[data-product-value]").focus();
                return false;
            }
        }

        const section = wizardSteps[step - 1];
        const invalidControl = Array.from(section.querySelectorAll("input, select, textarea"))
            .find((control) => !control.disabled && !control.checkValidity());
        if (invalidControl) {
            invalidControl.reportValidity();
            return false;
        }
        return true;
    };

    // Collect the user-editable fields so they can be serialized and restored later.
    const formControls = () =>
        Array.from(form.querySelectorAll("input[name], select[name], textarea[name]"));
    // Check whether a saved estimate exists in local storage and hide the load button when no project is available.
    const updateSavedProjectAvailability = () => {
        try {
            loadButton.hidden = localStorage.getItem(estimateRules.savedProjectKey) === null;
        } catch {
            loadButton.hidden = true;
            saveStatus.textContent = "Browser storage is unavailable. Saving and loading projects may not work in this browser.";
        }
    };
    // Mark the current project as modified after the user changes a saved form value.
    // This prevents the UI from showing a stale "saved" message after the user edits the form.
    const markSavedProjectAsChanged = () => {
        if (saveStatus.textContent.startsWith("Estimate saved")
            || saveStatus.textContent.startsWith("Saved estimate restored")
            || saveStatus.textContent.startsWith("Saved project restored")) {
            saveStatus.textContent = "Unsaved changes since the last save.";
        }
    };
    // Store the current estimator state in browser storage so a partially completed project can be restored later.
    const saveProject = () => {
        const savedProject = {
            version: 1,
            step: currentStep,
            estimateRequested,
            products: selectedProductTypes(),
            fields: formControls().map((control) => ({
                name: control.name,
                type: control.type,
                value: control.value,
                checked: control.type === "checkbox" || control.type === "radio"
                    ? control.checked : undefined
            }))
        };

        try {
            localStorage.setItem(estimateRules.savedProjectKey, JSON.stringify(savedProject));
            saveStatus.textContent = "Estimate saved on this browser. Use Load saved estimate to return to it later.";
            loadButton.hidden = false;
        } catch {
            saveStatus.textContent = "Could not save this estimate. Browser storage may be unavailable or full.";
        }
    };
    // Restore a previously saved estimate from browser storage and rebuild the form to match that saved state.
    // The saved data includes the selected products, the step the user was on, and the values of the controls.
    // This is useful when the user leaves the page and comes back without losing their in-progress quote.
    const loadProject = () => {
        try {
            const storedProject = localStorage.getItem(estimateRules.savedProjectKey);
            if (storedProject === null) {
                saveStatus.textContent = "No saved estimate was found in this browser.";
                loadButton.hidden = true;
                return;
            }

            const savedProject = JSON.parse(storedProject);
            const allowedProducts = new Set(Object.keys(products));
            if (savedProject?.version !== 1
                || !Number.isInteger(savedProject.step)
                || savedProject.step < 1
                || savedProject.step > wizardSteps.length
                || !Array.isArray(savedProject.products)
                || savedProject.products.some((product) => !allowedProducts.has(product))
                || !Array.isArray(savedProject.fields)) {
                throw new Error("The saved project has an unsupported format.");
            }

            const controls = formControls();
            for (const field of savedProject.fields) {
                if (!field || typeof field.name !== "string" || typeof field.type !== "string"
                    || typeof field.value !== "string") {
                    throw new Error("The saved project contains an invalid form value.");
                }
                const control = controls.find((candidate) =>
                    candidate.name === field.name
                    && candidate.type === field.type
                    && ((field.type === "radio" || field.type === "checkbox")
                        ? candidate.value === field.value : true));
                if (!control) throw new Error("The saved project no longer matches this estimator.");
                if (field.type === "radio" || field.type === "checkbox") {
                    if (typeof field.checked !== "boolean") {
                        throw new Error("The saved project contains an invalid selection.");
                    }
                } else if (field.type === "select-one"
                    && !Array.from(control.options, (option) => option.value).includes(field.value)) {
                    throw new Error("The saved project contains an unknown option.");
                }
            }

            const selectedProducts = new Set(savedProject.products);
            for (const button of productDropdown.querySelectorAll("[data-product-value]")) {
                button.setAttribute("aria-pressed", String(selectedProducts.has(button.dataset.productValue)));
            }
            updateProductOptions();
            for (const field of savedProject.fields) {
                const control = controls.find((candidate) =>
                    candidate.name === field.name
                    && candidate.type === field.type
                    && ((field.type === "radio" || field.type === "checkbox")
                        ? candidate.value === field.value : true));
                if (field.type === "radio" || field.type === "checkbox") {
                    control.checked = field.checked;
                } else {
                    control.value = field.value;
                }
            }

            estimateRequested = savedProject.estimateRequested === true;
            productSelectionAttempted = false;
            updateProductOptions();
            updateFootageValidation();
            updateCountValidation(cornerInput, cornerError, "corner units");
            updateCountValidation(sinkInput, sinkError, "sinks", sinkInput.disabled);
            updateMembershipFeedback();
            updateReview();
            showStep(savedProject.step, true);
            updateEstimateIfValid();
            saveStatus.textContent = estimateRequested && form.checkValidity()
                ? "Saved estimate restored on this browser."
                : "Saved project restored. Complete any missing required choices to build its estimate.";
        } catch (error) {
            saveStatus.textContent = error instanceof SyntaxError
                ? "Could not load the saved estimate because its saved data is unreadable."
                : `Could not load the saved estimate: ${error.message}`;
        }
    };

    // Connect the step controls and form actions to validation, navigation, and estimate generation.
    // Each event listener updates the wizard state, the review panel, and the saved-project status as the user interacts.
    // Wire up the main estimator actions.
    // The save and load buttons persist the form state in localStorage, while the edit-step click handler
    // lets the user jump back to an earlier wizard section without losing the data they already entered.
    saveButton.addEventListener("click", saveProject);
    loadButton.addEventListener("click", loadProject);
    form.addEventListener("click", (event) => {
        const editButton = event.target.closest("[data-edit-step]");
        if (editButton) showStep(Number(editButton.dataset.editStep), true);
    });

    // Product selection is handled directly on the selection buttons so the user can toggle items on and off.
    // The button state is stored with aria-pressed, which keeps the visual selection and accessibility state in sync.
    productDropdown.addEventListener("click", (event) => {
        const button = event.target.closest("[data-product-value]");
        if (!button) return;
        const isSelected = button.getAttribute("aria-pressed") === "true";
        button.setAttribute("aria-pressed", String(!isSelected));
        updateProductOptions();
        updateReview();
        updateEstimateIfValid();
    });

    // Advance through the wizard only when the current step passes validation.
    // This prevents the user from continuing while a required field is still blank or invalid.
    nextButton.addEventListener("click", () => {
        if (validateStep(currentStep)) showStep(currentStep + 1, true);
    });

    backButton.addEventListener("click", () => {
        showStep(currentStep - 1, true);
    });

    footageInput.addEventListener("input", updateFootageValidation);
    footageInput.addEventListener("blur", updateFootageValidation);
    cornerInput.addEventListener("input", () =>
        updateCountValidation(cornerInput, cornerError, "corner units"));
    cornerInput.addEventListener("blur", () =>
        updateCountValidation(cornerInput, cornerError, "corner units"));
    sinkInput.addEventListener("input", () =>
        updateCountValidation(sinkInput, sinkError, "sinks", sinkInput.disabled));
    sinkInput.addEventListener("blur", () =>
        updateCountValidation(sinkInput, sinkError, "sinks", sinkInput.disabled));

    // Recalculate the review and pricing output each time the user types into a field.
    // This keeps the UI reactive and makes the estimate feel live instead of waiting for a final submit action.
    form.addEventListener("input", () => {
        markSavedProjectAsChanged();
        updateFootageValidation();
        updateCountValidation(cornerInput, cornerError, "corner units");
        updateCountValidation(sinkInput, sinkError, "sinks", sinkInput.disabled);
        updateProductOptions();
        updateMembershipFeedback();
        updateReview();
        updateEstimateIfValid();
    });
    // Treat change events similarly to input events; they are important for selects, checkboxes, and radio buttons.
    // These controls often update only when the user commits a value, so we refresh the estimate and saved-state status on change too.
    form.addEventListener("change", () => {
        markSavedProjectAsChanged();
        updateFootageValidation();
        updateCountValidation(cornerInput, cornerError, "corner units");
        updateCountValidation(sinkInput, sinkError, "sinks", sinkInput.disabled);
        updateProductOptions();
        updateMembershipFeedback();
        updateReview();
        updateEstimateIfValid();
    });

    // Submit is prevented so the form behaves like a multi-step quote builder instead of a normal page submission.
    // The script validates all earlier steps before finalizing the estimate and moving focus to the result section.
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (currentStep < wizardSteps.length) {
            if (validateStep(currentStep)) showStep(currentStep + 1, true);
            return;
        }

        for (let step = 1; step < currentStep; step += 1) {
            if (!validateStep(step)) {
                showStep(step, true);
                return;
            }
        }
        estimateRequested = true;
        updateEstimate();
        result.focus();
    });

    // Reset returns the estimator to its default empty state.
    // This clears the saved status, removes any displayed image, resets validation messages, and reinitializes the wizard.
    form.addEventListener("reset", () => {
        estimateRequested = false;
        result.replaceChildren();
        saveStatus.textContent = "";
        productImage.hidden = true;
        productImage.removeAttribute("src");
        productImage.alt = "";
        footageInput.setCustomValidity("");
        footageInput.setAttribute("aria-invalid", "false");
        footageError.textContent = "";
        footageError.hidden = true;
        cornerInput.setCustomValidity("");
        cornerInput.setAttribute("aria-invalid", "false");
        cornerError.textContent = "";
        cornerError.hidden = true;
        sinkInput.setCustomValidity("");
        sinkInput.setAttribute("aria-invalid", "false");
        sinkError.textContent = "";
        sinkError.hidden = true;
        membershipLevel.value = "";
        updateMembershipFeedback();
        productSelectionAttempted = false;
        for (const button of productDropdown.querySelectorAll("[data-product-value]")) {
            button.setAttribute("aria-pressed", "false");
        }
        setTimeout(() => {
            updateProductOptions();
            updateFootageValidation();
            updateCountValidation(cornerInput, cornerError, "corner units");
            updateCountValidation(sinkInput, sinkError, "sinks", sinkInput.disabled);
            updateReview();
            showStep(1);
            updateSavedProjectAvailability();
        }, 0);
    });

    // Add actions inside the generated estimate summary.
    // Users can print the quote or copy it to the clipboard without leaving the page or reformatting the content manually.
    result.addEventListener("click", async (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.matches("[data-print-estimate]")) {
            window.print();
            return;
        }

        if (button.matches("[data-copy-estimate]")) {
            const status = result.querySelector("[data-action-status]");
            const estimateText = Array.from(result.querySelectorAll("table tr:not([hidden])"))
                .map((row) => Array.from(row.cells, (cell) => cell.textContent.trim()).filter(Boolean).join(": "))
                .join("\n");

            try {
                if (!navigator.clipboard?.writeText) {
                    throw new Error("Clipboard access is unavailable.");
                }
                await navigator.clipboard.writeText(`Kitchen Renovation Estimate\n${estimateText}`);
                status.textContent = "Estimate copied to clipboard.";
            } catch {
                status.textContent = "Could not copy the estimate. Try Print / save PDF instead.";
            }
        }
    });

    // Initialize the estimator on page load.
    // These calls set the default form state, draw the first step, clear stale validation messages, and show whether a saved project exists.
    updateProductOptions();
    updateMembershipFeedback();
    updateFootageValidation();
    updateCountValidation(cornerInput, cornerError, "corner units");
    updateCountValidation(sinkInput, sinkError, "sinks", sinkInput.disabled);
    showStep(1);
    updateSavedProjectAvailability();
})();
