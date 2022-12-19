import { opmlToJSON, opmlToJsonResult } from 'opml-to-json';
import { pool } from '@db';
import {
  addCollection,
  hasCollectionWithUrl,
  recalculateCollectionsOrder,
} from '@db/collections';
import { getPreferences } from '@db/preferences';
import { getUser } from '@db/users';
import { defaultIcon, ID } from '@orpington-news/shared';
import { normalizeUrl } from '@utils';
import { fetchRSSJob } from '@tasks';

export const importOPML = async (xml: string, userId: ID) => {
  const json = await opmlToJSON(xml);

  const { homeId } = await pool.one(getUser(userId));
  const { defaultCollectionLayout } = await pool.one(getPreferences(userId));

  await pool.transaction(async (conn) => {
    // Add root collection
    const [{ id }] = await conn.any(
      addCollection(
        {
          title: json.title,
          icon: defaultIcon,
          layout: defaultCollectionLayout,
          parentId: homeId,
        },
        userId
      )
    );

    // Add child collections
    const importChildren = async (
      children: opmlToJsonResult['children'],
      parentId?: ID
    ) => {
      for (const child of children) {
        if (!('text' in child)) {
          // ignore invalid item
          continue;
        }

        if ('children' in child) {
          const [{ id }] = await conn.any(
            addCollection(
              {
                title: child.text as any,
                icon: defaultIcon,
                parentId,
                layout: defaultCollectionLayout,
              },
              userId
            )
          );

          await importChildren((child as any).children, id);
        } else {
          const xmlUrl = child.xmlurl && normalizeUrl(child.xmlurl as any);
          if (!xmlUrl) {
            // ignore invalid item
            continue;
          }

          const isUrlAlreadyUsed = await conn.exists(
            hasCollectionWithUrl(xmlUrl, userId)
          );
          if (isUrlAlreadyUsed) {
            continue;
          }

          await conn.any(
            addCollection(
              {
                title: child.text as any,
                url: xmlUrl,
                icon: defaultIcon,
                parentId,
                layout: defaultCollectionLayout,
              },
              userId
            )
          );
        }
      }
    };

    await importChildren(json.children, id);
    await conn.any(recalculateCollectionsOrder());
  });

  fetchRSSJob.start();
};
