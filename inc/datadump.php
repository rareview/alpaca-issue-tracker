<?php

add_action('wp_footer', function() {
    global $wp_query;
    $theme = wp_get_theme();
    $user = wp_get_current_user();

    $wp_data = array(
        "theme" => array(
            "stylesheet" => $theme->stylesheet,
            "version" => $theme->get("Version")
        ),
        "plugins" => get_option('active_plugins', false),
        "queryVars" => $wp_query->query_vars,
        "bodyClasses" => get_body_class(),
    );
?>
<script type="text/javascript">
    const b = bowser.parse(window.navigator.userAgent);
    const alpaca_data = {
        user: { id: <?php echo $user->id; ?>, displayName: <?php echo json_encode($user->display_name); ?> },
        device: {
            browser: { name: b.browser.name, version: b.browser.version, },
			vendor: b.platform.vendor,
            type: b.platform.type,
            os: b.os.name,
            version: b.os.version,
            versionName: b.os.versionName
        },
        wp: <?php echo json_encode($wp_data) ?>
    };
</script>
<?php
}, 9999);