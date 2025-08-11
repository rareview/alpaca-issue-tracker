<?php

add_action('wp_footer', 'alpaca_add_datadump', 9999);
add_action('admin_footer', 'alpaca_add_datadump', 9999);

 function alpaca_add_datadump( ) {
    global $wp_query, $post, $template;
    $theme = wp_get_theme();
    $user = wp_get_current_user();

    $type = array();
    if( is_admin() ) {
        $type[] = "wp-admin";
    } elseif( is_customize_preview() ) {
        $type[] = "customize_preview";
    } elseif ( is_front_page() ) {
        $type[] = "front_page";
    } elseif ( is_home() ) {
        $type[] = "home";
    } elseif ( is_singular() ) {
        $type[] = "singular";
        $type[] = get_post_type();
    } elseif ( is_archive() ) {
        $type[] = "archive";
        if( is_date() ) {
            $type[] = "date";
        } elseif( is_category() || is_tag() || is_tax() ) {
            $type[] = "taxonomy";
            $type[] = get_queried_object()->taxonomy;
            $type[] = get_queried_object()->slug;
        } elseif( is_post_type_archive() ) {
            $type[] = "post_type";
            $type[] = $wp_query->query_vars['post_type'];
        } elseif( is_author() ) {
            $type[] = "author";
        }
    } elseif ( is_search() ) {
        $type[] = "search";
    } elseif ( is_404() ) {
        $type[] = "404";
    } else {
        $type[] = "unidentified";
    }
    if( is_preview()) {
        $type[] = "preview";
    }
    if( is_customize_preview() ) {
        $type[] = "customize_preview";
    }

    $wp_data = array(
        "theme" => array(
            "stylesheet" => $theme->stylesheet,
            "version" => $theme->get("Version")
        ),
        "plugins" => get_option('active_plugins', false),
        "queryVars" => $wp_query->query_vars,
        "queriedObject" => $wp_query->get_queried_object(),
        "type" => $type,
        "template" => basename($template),
        "bodyClasses" => get_body_class(),
    );

    $user_data = array(
        "id" => $user->id,
        "displayName" => $user->display_name
    );

    // Combine all data into a single object
    $alpaca_data = array(
        "time" => time(),
        "user" => $user_data,
        "server" => $_SERVER,
        "wp" => $wp_data,
    );

    // Encode the JSON string into Base64:
    // $encoded_data = base64_encode(json_encode($alpaca_data));
    // Then to decode the Base64 string and parse the JSON:
    // in JS: decoded_data=atob(encoded_data) then JSON.parse(decoded_data);
    // in PHP: $decoded_data=base64_decode($encoded_string) then json_decode($decoded_string)

    $alpaca_json = json_encode($alpaca_data);

?>
<script type="text/javascript">
    const b = bowser.parse(window.navigator.userAgent);

    const alpaca_data = {
        "env": "<?php echo base64_encode($alpaca_json); ?>",
        "raw": <?php echo json_encode($alpaca_data); ?>, // NOT USED: delete when no longer needed
        "device": {
            "browser": {
                name: b.browser.name,
                version: b.browser.version,
                width: window.innerWidth,
                height: window.innerHeight
            },
            "vendor": b.platform.vendor,
            "model": b.platform.model,
            "type": b.platform.type,
            "os": b.os.name,
            "version": b.os.version,
            "versionName": b.os.versionName
        },
        // "referrer": document.referrer,
    };

    window.addEventListener('resize', function() {
        alpaca_data.device.browser.width = window.innerWidth;
        alpaca_data.device.browser.height = window.innerHeight;
    });
</script>

<?php
}