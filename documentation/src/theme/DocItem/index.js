import React from 'react';
import OriginalDocItem from '@theme-original/DocItem';
import Head from '@docusaurus/Head';

export default function DocItem(props) {
  const { metadata } = props.content; // ← SAFE: metadata is passed in props
  const { source } = metadata;

  // Clean the source path
  const cleanSource = source.replace(/^@site\//, '').replace(/^docs\//, '');

  const mdPath = `/md/${cleanSource}`;

  return (
    <>
      <Head>
        <link rel="alternate" type="text/markdown" href={mdPath} />
      </Head>

      <OriginalDocItem {...props} />
    </>
  );
}
