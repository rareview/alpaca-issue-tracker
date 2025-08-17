<?php
add_action('admin_head', 'expose_admin_colors');

function expose_admin_colors() {
    global $_wp_admin_css_colors;

    $current_scheme = get_user_option('admin_color');

    if (isset($_wp_admin_css_colors[$current_scheme])) {
        $scheme = $_wp_admin_css_colors[$current_scheme];
        $colors = $scheme->colors;

        echo '<style id="myplugin-admin-colors">:root {';
        foreach ($colors as $i => $color) {
            // Expose each admin color as a CSS variable
            printf('--admin-color-%d: %s; ', $i + 1, esc_html($color));
        }

        echo '}</style>';
    }
}