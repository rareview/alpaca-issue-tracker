<?php
/**
 * GitHub webhook integration and verification.
 *
 * @package Alpaca
 */

/**
 * Verify GitHub webhook payload signature.
 *
 * @param string $body      Raw request body.
 * @param string $signature Signature from the X-Hub-Signature-256 header.
 *
 * @return bool True if verified, false otherwise.
 *
 * Reference: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 */
function alpaca_verify_github_payload( string $body, string $signature ): bool {

	$secret = get_option( 'alpaca_webhook_secret_github' );

	if ( empty( $secret ) || empty( $signature ) ) {
		return false;
	}

	// Ensure signature has the correct format (sha256=hash).
	if ( ! str_starts_with( $signature, 'sha256=' ) ) {
		return false;
	}

	// Compute expected signature using our stored secret.
	$expected = 'sha256=' . hash_hmac( 'sha256', $body, $secret );

	// Time-safe comparison of signatures.
	return hash_equals( $expected, $signature );
}
