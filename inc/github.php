<?php

/**
 * Verify GitHub webhook payload signature.
 *
 * @param string $body      Raw request body.
 * @param string $signature Signature from the X-Hub-Signature-256 header.
 *
 * @return bool True if verified, false otherwise.
 * 
 * Reference:
 * https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 */
function verify_github_payload( string $body, string $signature ): bool {

    $secret = get_option( 'alpaca_webhook_secret_github' );

    if ( empty( $secret ) || empty( $signature ) ) {
        return false;
    }

    // Signature would normally be hashed prior to receipt
    // If we're testing: we need to hash it here ourselves
    // $signature_hash = 'sha256=' . hash_hmac( 'sha256', $body, $signature );

    // Compute HMAC with stored secret
    $expected = 'sha256=' . hash_hmac( 'sha256', $body, $secret );

    // Safely compare signatures
    return hash_equals( $expected, $signature_hash );
}
