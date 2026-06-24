# Sticky Add to Cart - User Guide

**Estimated read time: 12 min** · **Last updated: February 2026**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Styling Tab](#styling-tab)
   - [Bar Appearance](#bar-appearance)
   - [Typography & Colors](#typography--colors)
   - [Button Styling](#button-styling)
   - [Product Image](#product-image)
   - [Variant Selector](#variant-selector)
   - [Quantity Picker](#quantity-picker)
5. [Layout Tab](#layout-tab)
   - [Element Arrangement](#element-arrangement)
   - [Position on Page](#position-on-page)
   - [Width & Alignment](#width--alignment)
   - [Spacing](#spacing)
6. [Behavior Tab](#behavior-tab)
   - [Display Settings](#display-settings)
   - [Animation](#animation)
   - [Cart Behavior](#cart-behavior)
   - [Mobile Settings](#mobile-settings)
   - [Advanced](#advanced)
7. [Live Preview](#live-preview)
8. [Saving Your Settings](#saving-your-settings)
9. [FAQs & Troubleshooting](#faqs--troubleshooting)

---

## Introduction

**Sticky Add to Cart** is a BigCommerce app that adds a persistent, fully customizable "Add to Cart" bar to every product page on your store. As shoppers scroll down the page, the bar stays visible - keeping the purchase action always within reach and reducing friction at the most critical point of the buying journey.

With a powerful visual configurator, real-time live preview, and zero coding required, you can match the bar's look and behavior exactly to your brand - in minutes.

**Key benefits:**
- Increase conversion rates by eliminating the need for shoppers to scroll back up to add items to their cart
- Fully customize the bar's appearance including colors, fonts, shadows, gradients, and button styles
- Control exactly which elements appear (product image, title, price, variant selectors, quantity picker, and the Add to Cart button) and in what order
- Set smart trigger behavior - show the bar on scroll, always, or after a timed delay
- Preview every change in real time before publishing to your live storefront

---

## Getting Started

Setting up Sticky Add to Cart takes just a few minutes. Follow these four steps to get your bar live on your store.

### Step 1 - Install the App

1. Visit the [BigCommerce App Marketplace](https://www.bigcommerce.com/apps/) and search for **Sticky Add to Cart**.
2. Click **Get This App** and follow the on-screen prompts to install it to your store.
3. Once installed, the app will appear under **Apps** in your BigCommerce control panel.

### Step 2 - Open the App

1. From your BigCommerce control panel, navigate to **Apps > My Apps**.
2. Click on **Sticky Add to Cart** to launch the app dashboard.

### Step 3 - Configure Your Bar

The dashboard opens directly to the configuration panel. Use the three tabs - **Styling**, **Layout**, and **Behavior** - to customize the sticky bar to your preferences. Every change is reflected instantly in the Live Preview panel on the right.

### Step 4 - Save & Go Live

Once you are satisfied with your configuration, click **Save Changes**. The app will automatically install the bar on all product pages of your store - no theme edits or code changes required.

> **Note:** If you want to disable the bar temporarily without losing your settings, toggle off **Enable Sticky Bar** in the **Behavior** tab and save.

---

## Dashboard Overview

The dashboard is divided into two main areas:

**Left - Configuration Panel**
The configuration panel contains three tabs: **Styling**, **Layout**, and **Behavior**. Each tab groups related settings into collapsible section cards, making it easy to find what you need. Scroll through the panel to access all options.

**Right - Live Preview**
The live preview displays a simulated product page with your sticky bar applied in real time. Switch between **Desktop** and **Mobile** views using the toggle in the preview toolbar. Use the **Full Preview** button to open an expanded preview in a new browser tab.

**Top - Header**
The header displays the app logo and a **Help** button. Clicking "Help" reveals the app version number and support contact email.

**Bottom - Save Bar**
Whenever you make changes, a floating save bar appears at the bottom of the screen. It gives you the option to **Save Changes** or **Discard** unsaved edits.

---

## Styling Tab

The **Styling** tab controls the visual appearance of the sticky bar, including its background, typography, button design, and individual element styles.

---

### Bar Appearance

Control the overall look of the sticky bar container.

- **Background Color** - Sets the solid background color of the bar. Click the color swatch to open the color picker and enter a hex value or select a color visually.
- **Enable Gradient** - Toggle on to replace the solid background with a two-color gradient. When enabled, the following options appear:
  - **Gradient From** - The starting color of the gradient.
  - **Gradient To** - The ending color of the gradient.
  - **Direction** - Choose from Horizontal (Left → Right), Vertical (Top → Bottom), or Diagonal (Top-Left → Bottom-Right). A live gradient preview strip is shown below the controls.
- **Border Radius** - Rounds the corners of the bar. Use the slider to set a value from 0 (sharp corners) to 30px.
- **Padding** - Controls the internal spacing between the bar's edge and its content. Adjustable from 4px to 32px.
- **Shadow** - Adds a drop shadow to the bar for depth. Options include None, Small, Medium, Large, and Extra Large.
- **Border Width** - Sets the thickness of a border around the bar (0–5px). When set above 0, a **Border Color** picker appears.
- **Opacity** - Controls the transparency of the entire bar (20%–100%).

---

### Typography & Colors

Control text styles for the product title, price, and all text within the bar.

- **Title Color** - Sets the color of the product name displayed in the bar.
- **Title Weight** - Sets the font weight of the product title. Options: Light, Normal, Medium, Semibold, Bold, Extra Bold.
- **Price Color** - Sets the color of the current (selling) price.
- **Price Weight** - Sets the font weight of the price. Options: Normal, Medium, Semibold, Bold, Extra Bold.
- **Compare Price** - Sets the color of the original (compare-at) price.
- **Compare Style** - Choose how the compare-at price is displayed:
  - **Strikethrough** - Shows the original price with a line through it (e.g., ~~$399.99~~).
  - **Sale Badge** - Shows a colored discount badge (e.g., `-25%`).
- **Font Family** - Choose a font for all text within the bar. Options include Store Default (inherits your theme's font), System UI, Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Georgia, Playfair Display, Segoe UI, and Arial.
- **Font Size** - Sets the base font size for bar text. Options range from XS (11px) to XXL (20px).
- **Text Transform** - Controls the capitalization of text. Options: None, UPPERCASE, lowercase, Capitalize.
- **Letter Spacing** - Adjusts the spacing between characters (-1px to 5px).

---

### Button Styling

Customize the "Add to Cart" button's appearance and label.

- **Button Style** - Choose the button shape and fill:
  - **Filled (Solid)** - Solid color background.
  - **Outline** - Transparent background with a colored border.
  - **Pill Shape** - Fully rounded, capsule-style button.
  - **Ghost (Transparent)** - No background or border; text-only style.
- **Background Color** - The button's fill color.
- **Hover Background** - The color the button transitions to when hovered.
- **Text Color** - The color of the button label text.
- **Border Color / Border Width** - Available for Outline and Ghost styles; sets the button border color and thickness.
- **Border Radius** - Rounds the button corners (0–30px).
- **Padding X / Padding Y** - Controls horizontal and vertical padding inside the button.
- **Font Weight** - Sets the button label weight: Normal, Medium, Semibold, or Bold.
- **Shadow** - Adds a drop shadow to the button: None, Small, Medium, or Large.
- **Button Text** - Customize the label on the button (default: "Add to Cart"). Enter any text to match your brand voice.
- **Show Cart Icon** - Toggle on to display a shopping cart icon alongside the button label.

---

### Product Image

Configure the product thumbnail shown in the sticky bar.

> **Note:** This section is collapsed by default. Click the section header to expand it.

- **Image Size** - Sets the width and height of the product thumbnail (24px–80px).
- **Border Radius** - Rounds the corners of the image (0–20px).
- **Border Width** - Adds a border around the image (0–4px). When set above 0, a **Border Color** picker appears.

---

### Variant Selector

Control how product options (e.g., Size, Color) are displayed inside the sticky bar.

> **Note:** This section is collapsed by default. Click the section header to expand it.

- **Show Variant Labels** - Toggle on to display the option name (e.g., "Size:", "Color:") beside each variant control.
- **Variant Option Types** - Configure the display style for each individual product option:
  - Enter the **Option Name** exactly as it appears in your BigCommerce product settings (case-insensitive matching is used).
  - Select a **Display Type** for that option:
    - **Dropdown** - A compact dropdown select menu.
    - **Swatch** - Small square tiles showing the first letter(s) of each value.
    - **Radio Buttons** - Circular radio-style selectors with a label.
    - **Rectangle List** - Clickable rectangular buttons for each value.
  - Click **+ Add Variant Option** to configure additional options. Options not configured here will default to the Dropdown display type.
- **Active / Selected Color** - The highlight color applied to the currently selected variant value.
- **Border Color** - The border color of variant controls.
- **Text Color** - The text color inside variant controls.
- **Border Radius** - Rounds the corners of variant controls (0–16px).

---

### Quantity Picker

Customize the quantity input control shown in the sticky bar.

> **Note:** This section is collapsed by default. Click the section header to expand it.

- **Picker Style** - Choose how customers adjust quantity:
  - **Plus / Minus Buttons** - A classic stepper with `−` and `+` buttons flanking the current value.
  - **Dropdown Select** - A dropdown menu for quantity selection.
  - **Number Input** - A plain text input showing the current quantity value.
- **Text Color** - The color of the quantity number displayed.
- **Background Color** - The background color of the quantity control.
- **Button / Icon Color** - The color of the `+` and `−` icons (applies to the Plus/Minus style).
- **Border Color** - The border color of the quantity control.
- **Border Radius** - Rounds the corners of the quantity control (0–16px).

---

## Layout Tab

The **Layout** tab controls the structure of the sticky bar - what elements appear, where the bar sits on the page, how wide it is, and how content is spaced.

---

### Element Arrangement

Choose which elements appear in the bar and control their display order.

- Each element (Product Image, Product Title, Price, Variant Selector, Quantity Picker, Add to Cart Button) is listed as a draggable row.
- **Reorder** - Drag and drop rows to rearrange the order elements appear in the bar.
- **Visibility** - Click the eye icon on any row to show or hide that element. Hidden elements are excluded from the bar entirely.

---

### Position on Page

Choose where the sticky bar is anchored on the screen:

- **Bottom** - Fixed to the bottom edge of the viewport (default and most common).
- **Top** - Fixed to the top edge of the viewport, below the browser navigation.
- **Left** - Fixed to the left side of the viewport, centered vertically.
- **Right** - Fixed to the right side of the viewport, centered vertically.

---

### Width & Alignment

Control the horizontal sizing and content alignment within the bar.

- **Bar Width** - Choose between two modes:
  - **Full Width** - The bar stretches edge to edge across the viewport.
  - **Contained** - The bar is constrained to a maximum width. When selected, a **Bar Max Width** slider appears (600px–1800px).
- **Content Max Width** - Limits the width of the inner content area within the bar. Set to 0 for no limit (content fills the full bar width).
- **Justify Content** - Controls how elements are distributed horizontally:
  - Start, Center, End, Space Between, Space Around, Space Evenly.
- **Vertical Alignment** - Controls how elements are aligned vertically within the bar: Top, Center, or Bottom.

---

### Spacing

Fine-tune the gaps between elements and the bar's distance from the viewport edge.

> **Note:** This section is collapsed by default. Click the section header to expand it.

- **Element Gap** - The space (in pixels) between individual elements within the same group (e.g., between the product image and title).
- **Bar Offset** - The distance between the bar and the edge of the viewport (0–50px). Use this to add a small margin so the bar doesn't sit flush against the screen edge.
- **Group Gap** - The space between the left group (Image, Title, Price) and the right group (Variant Selector, Quantity Picker, Button). This is useful for creating a clear visual separation between product information and the purchasing controls.

---

## Behavior Tab

The **Behavior** tab controls when and how the sticky bar appears, how it animates, how it reacts after items are added to the cart, and how it behaves on mobile devices.

---

### Display Settings

- **Enable Sticky Bar** - Master toggle to show or hide the sticky bar across your entire store. Disable this to turn off the bar without deleting your settings.
- **Trigger Mode** - Choose when the bar appears on the page:
  - **Show on scroll (when Add to Cart leaves viewport)** - The bar appears only after the shopper has scrolled far enough that the original "Add to Cart" button on the product page is no longer visible. This is the recommended default - it avoids redundancy and feels natural to shoppers.
  - **Always visible on page load** - The bar is displayed as soon as the product page loads, regardless of scroll position.
  - **Show after time delay** - The bar appears after a set number of seconds. When selected, a **Delay** field appears (0–30 seconds).
- **Scroll Threshold** - Visible when "Show on scroll" is selected. Sets the percentage of the page the shopper must scroll before the bar appears (10%–100%).
- **Show Close Button** - Toggle on to display an "×" dismiss button on the bar, allowing shoppers to hide it. When enabled, a **Close Behavior** option appears:
  - **Hide temporarily (reappears on next scroll)** - The bar is dismissed until the page is scrolled again.
  - **Hide until page is scrolled again** - Similar to above; the bar reappears on the next scroll interaction.
  - **Hide for entire session** - The bar remains hidden for the rest of the browser session.

---

### Animation

Control the motion effects when the bar enters and exits the screen.

- **Entry Animation** - The animation played when the bar appears:
  - **Slide In** - The bar slides in from the edge of the screen.
  - **Fade In** - The bar fades in from transparent to opaque.
  - **Bounce In** - The bar slides in with a subtle bounce effect.
  - **No Animation (Instant)** - The bar appears immediately with no transition.
- **Exit Animation** - The animation played when the bar is dismissed or hidden:
  - **Slide Out**, **Fade Out**, or **No Animation (Instant)**.
- **Animation Duration** - Controls how long the entry animation takes to complete (100ms–1000ms). A preview summary is shown below the slider (e.g., "Bar will slide in over 300ms and slide out").

---

### Cart Behavior

Control what happens after a shopper clicks "Add to Cart" from the sticky bar.

- **Show Success Notification** - Toggle on to display a confirmation message after an item is successfully added to the cart. When enabled, a **Success Message** text field appears where you can customize the notification text (default: "Added to cart successfully!").
- **Auto-Hide After Add to Cart** - Toggle on to automatically hide the sticky bar after a successful add-to-cart action. When enabled, a **Hide After** field appears to set the delay (1–30 seconds) before the bar is hidden.

---

### Mobile Settings

> **Note:** This section is collapsed by default. Click the section header to expand it.

- **Show on Mobile** - Toggle off to hide the sticky bar entirely on mobile devices.
- **Compact Mobile Layout** - Toggle on to display a smaller, more space-efficient version of the bar on mobile screens.
- **Mobile Breakpoint** - The maximum screen width (in pixels) that is treated as "mobile." Screens narrower than this value will use the mobile layout. Adjustable from 320px to 1024px (default: 768px).

---

### Advanced

> **Note:** This section is collapsed by default. Click the section header to expand it.

- **Z-Index** - Controls the stacking order of the sticky bar relative to other page elements. A higher value ensures the bar appears above other overlapping elements such as chat widgets or cookie banners. The default value is `9999`. Adjust this only if the bar is being hidden behind other elements on your storefront.
- **Custom CSS Class** - Add one or more custom CSS class names to the sticky bar element. This allows you to apply additional styles from your theme's stylesheet without modifying the app's built-in styles (e.g., `my-sticky-bar`).

---

## Live Preview

The **Live Preview** panel on the right side of the dashboard shows a real-time simulation of how your sticky bar will look on a product page.

- **Desktop / Mobile toggle** - Switch between desktop and mobile viewpoints using the monitor and smartphone icons in the preview toolbar. The mobile view simulates a 375px-wide device screen and scales the bar elements proportionally.
- **Active / Inactive status indicator** - A badge in the preview toolbar shows whether the bar is currently enabled or disabled based on your settings.
- **Full Preview button** - Opens a full-page, expanded preview in a new browser tab. This is useful for reviewing the bar at your actual screen resolution before saving.

> **Note:** The live preview uses a sample product ("Premium Wireless Headphones") with placeholder data to demonstrate how real product information will appear. The actual product name, price, and images displayed in your store will come from BigCommerce automatically.

---

## Saving Your Settings

Whenever you modify any setting, a floating **save bar** appears at the bottom of the screen.

- Click **Save Changes** to apply your settings and publish them to your storefront. The app will automatically update the script on your store - no manual theme edits required.
- Click **Discard** to revert all unsaved changes back to the last saved state.

A toast notification will confirm whether the save was successful or if an error occurred.

> **Tip:** Make all your changes across the Styling, Layout, and Behavior tabs before saving - you only need to save once to apply everything.

---

## FAQs & Troubleshooting

**The sticky bar is not appearing on my product pages.**
- Ensure **Enable Sticky Bar** is toggled on in the Behavior tab and that your settings have been saved.
- If **Trigger Mode** is set to "Show on scroll," scroll down the product page past the original "Add to Cart" button to trigger the bar.
- Check the **Z-Index** value in the Advanced section. If another element on your storefront has a higher z-index, it may be covering the bar. Try increasing the z-index value.

**The bar appears but the Add to Cart button isn't working.**
- Ensure your BigCommerce product pages are set up correctly and that the original Add to Cart button on the product page is functional.
- Contact our support team at [info@codinative.com](mailto:info@codinative.com) with your store URL so we can investigate.

**My variant options are not appearing correctly in the bar.**
- Make sure the option names entered under **Styling > Variant Selector > Variant Option Types** match your BigCommerce product option names exactly (the matching is case-insensitive, but spelling must be correct).
- Options not configured will default to the Dropdown display type.

**The bar is overlapping my store's live chat widget or cookie banner.**
- Increase the **Z-Index** value in the Behavior > Advanced section if the bar is appearing behind other elements, or decrease it if it is appearing in front of elements it shouldn't overlap.
- Use the **Bar Offset** setting in Layout > Spacing to add vertical distance between the bar and the screen edge.

**Can I disable the bar for specific products?**
- The current version of Sticky Add to Cart applies the bar globally across all product pages. Per-product control is not available at this time.

**The bar style doesn't match my theme after saving.**
- Use the **Font Family** setting in the Styling > Typography section and set it to **Store Default** to inherit your theme's font automatically.
- Use the **Custom CSS Class** in Advanced to apply additional theme-specific overrides via your theme's stylesheet.

**How do I contact support?**
- Reach our team at [info@codinative.com](mailto:info@codinative.com). Please include your store URL and a description of the issue for the fastest response.

---

*Sticky Add to Cart is developed and maintained by [Codinative](https://codinative.com).*
