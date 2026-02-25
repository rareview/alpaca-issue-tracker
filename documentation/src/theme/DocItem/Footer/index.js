import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import TagsListInline from '@theme/TagsListInline';

export default function DocItemFooter() {
  const { metadata } = useDoc();
  const { source, tags } = metadata;

  const canDisplayTagsRow = tags.length > 0;

  // Clean the source path
  const cleanSource = source
    .replace(/^@site\//, '') // remove @site/
    .replace(/^docs\//, ''); // remove docs/

  const mdPath = `/md/${cleanSource}`;

  return (
    <footer
      className={clsx(ThemeClassNames.docs.docFooter, 'docusaurus-mt-lg')}
    >
      {canDisplayTagsRow && (
        <div
          className={clsx(
            'row margin-top--sm',
            ThemeClassNames.docs.docFooterTagsRow,
          )}
        >
          <div className="col">
            <TagsListInline tags={tags} />
          </div>
        </div>
      )}

      {/* Markdown button */}
      <div
        className={clsx(
          'margin-top--sm',
          ThemeClassNames.docs.docFooterEditMetaRow,
        )}
      >
        <a
          href={mdPath}
          rel="noopener noreferrer"
          className="button button--primary button--md"
        >
          View page as Markdown
        </a>
      </div>
    </footer>
  );
}
