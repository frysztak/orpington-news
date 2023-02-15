import { Collection } from '@shared';
import { buildParentsChildrenMap } from '@features/Collections';
import { DropEvent } from '.';
import { HoverEvent, TargetInfo } from './dndTypes';
import {
  resolveIfCanDrop,
  resolveLogicalPosition,
  resolveNewParentAfterDrop,
} from './resolvers';
import { sampleCollections } from '@components/collection/sampleData';

describe('resolveLogicalPosition', () => {
  it(`returns 'child' when hovering in the middle`, () => {
    expect(resolveLogicalPosition({} as TargetInfo, 'center')).toBe('child');
  });

  it(`returns 'child' when hovering in the bottom and parent has children`, () => {
    expect(
      resolveLogicalPosition(
        {
          targetCollectionHasChildren: true,
        } as TargetInfo,
        'bottom'
      )
    ).toBe('child');
  });

  it(`returns 'belowParent' when hovering in the bottom of last child item`, () => {
    expect(
      resolveLogicalPosition(
        {
          targetCollectionParentId: 2,
          targetCollectionLastChild: true,
        } as TargetInfo,
        'bottom'
      )
    ).toBe('belowParent');
  });

  it(`returns 'above' when hovering at the top of parentless first item`, () => {
    expect(
      resolveLogicalPosition(
        {
          targetCollectionIndex: 0,
        } as TargetInfo,
        'top'
      )
    ).toBe('above');
  });

  it(`returns 'below' when hovering at the top of first item with parent`, () => {
    expect(
      resolveLogicalPosition(
        {
          targetCollectionIndex: 0,
          targetCollectionParentId: 2,
        } as TargetInfo,
        'top'
      )
    ).toBe('below');
  });

  it(`returns 'below' when hovering at the very bottom top of last item without parent`, () => {
    expect(
      resolveLogicalPosition(
        {
          targetCollectionIndex: 2,
          targetCollectionLastChild: true,
        } as TargetInfo,
        'bottom'
      )
    ).toBe('below');
  });
});

describe('resolveIfCanDrop', () => {
  const { parentsMap } = buildParentsChildrenMap(sampleCollections);

  it('returns false when hovering collection over itself', () => {
    const event: HoverEvent = {
      type: 'hover',
      draggedCollectionId: 2,
      hoverPosition: 'center',
      targetInfo: {
        targetCollectionId: 2,
      } as TargetInfo,
    };

    expect(resolveIfCanDrop(event, parentsMap)).toStrictEqual({
      canDrop: false,
      reason: 'Cannot drop collection on itself',
    });
  });

  it('returns false when hovering a parent collection over its immediate child', () => {
    const event: HoverEvent = {
      type: 'hover',
      draggedCollectionId: 3,
      hoverPosition: 'center',
      targetInfo: {
        targetCollectionId: 301,
      } as TargetInfo,
    };

    expect(resolveIfCanDrop(event, parentsMap)).toStrictEqual({
      canDrop: false,
      reason: 'Cannot drop collection inside itself',
    });
  });

  it('returns false when hovering a parent collection over its nested child', () => {
    const event: HoverEvent = {
      type: 'hover',
      draggedCollectionId: 3,
      hoverPosition: 'center',
      targetInfo: {
        targetCollectionId: 30201,
      } as TargetInfo,
    };

    expect(resolveIfCanDrop(event, parentsMap)).toStrictEqual({
      canDrop: false,
      reason: 'Cannot drop collection inside itself',
    });
  });

  it('returns true for every other case', () => {
    const event: HoverEvent = {
      type: 'hover',
      draggedCollectionId: 3,
      hoverPosition: 'center',
      targetInfo: {
        targetCollectionId: 1,
      } as TargetInfo,
    };

    expect(resolveIfCanDrop(event, parentsMap)).toStrictEqual({
      canDrop: true,
    });
  });
});

describe('resolveNewParentAfterDrop', () => {
  const Collections: Collection[] = [
    {
      id: 1,
      title: 'Hacker News',
      icon: 'HackerNews',
      order: 0,
      parents: [],
      level: 0,
      refreshInterval: 60,
      unreadCount: 0,
      children: [],
      orderPath: [0],
    },
    {
      id: 2,
      title: 'Whateverblog',
      icon: 'React',
      order: 1,
      parents: [],
      level: 0,
      refreshInterval: 60,
      unreadCount: 0,
      children: [],
      orderPath: [1],
    },
    {
      id: 3,
      title: 'Whateverblog2',
      icon: 'React',
      order: 2,
      parents: [],
      level: 0,
      refreshInterval: 60,
      unreadCount: 0,
      children: [3, 31],
      orderPath: [2],
    },
    {
      id: 31,
      title: 'Whateverchild01',
      icon: 'React',
      order: 0,
      parents: [3],
      level: 1,
      refreshInterval: 60,
      unreadCount: 0,
      children: [311],
      orderPath: [2, 0],
    },
    {
      id: 311,
      title: 'Whateverchild01-01',
      icon: 'React',
      order: 0,
      parents: [3, 31],
      level: 2,
      refreshInterval: 60,
      unreadCount: 0,
      children: [3111],
      orderPath: [2, 0, 0],
    },
    {
      id: 3111,
      title: 'Whateverchild01-01-01',
      icon: 'React',
      order: 0,
      parents: [3, 31, 311],
      level: 3,
      refreshInterval: 60,
      unreadCount: 0,
      children: [],
      orderPath: [2, 0, 0, 0],
    },
  ];

  const { parentsMap } = buildParentsChildrenMap(Collections);

  describe(`logicalPosition 'above'`, () => {
    it('works for collection without children', () => {
      const event: DropEvent = {
        type: 'drop',
        hoverPosition: 'top',
        draggedCollectionId: 1,
        targetInfo: {
          targetCollectionHasChildren: false,
          targetCollectionId: 2,
          targetCollectionIndex: 0,
          targetCollectionLastChild: false,
        },
      };

      expect(
        resolveLogicalPosition(event.targetInfo, event.hoverPosition)
      ).toBe('above');

      expect(resolveNewParentAfterDrop(event, parentsMap)).toStrictEqual({
        collectionId: 1,
        newParentId: null,
        newOrder: 0,
      });
    });
  });

  describe(`logicalPosition 'child'`, () => {
    it('works for collection without children', () => {
      const event: DropEvent = {
        type: 'drop',
        hoverPosition: 'center',
        draggedCollectionId: 1,
        targetInfo: {
          targetCollectionHasChildren: false,
          targetCollectionId: 2,
          targetCollectionIndex: 1,
          targetCollectionLastChild: false,
        },
      };

      expect(
        resolveLogicalPosition(event.targetInfo, event.hoverPosition)
      ).toBe('child');

      expect(resolveNewParentAfterDrop(event, parentsMap)).toStrictEqual({
        collectionId: 1,
        newParentId: 2,
        newOrder: 0,
      });
    });

    it('works for collection with children', () => {
      const event: DropEvent = {
        type: 'drop',
        hoverPosition: 'center',
        draggedCollectionId: 1,
        targetInfo: {
          targetCollectionHasChildren: true,
          targetCollectionId: 2,
          targetCollectionIndex: 1,
          targetCollectionLastChild: false,
        },
      };

      expect(
        resolveLogicalPosition(event.targetInfo, event.hoverPosition)
      ).toBe('child');

      expect(resolveNewParentAfterDrop(event, parentsMap)).toStrictEqual({
        collectionId: 1,
        newParentId: 2,
        newOrder: 0,
      });
    });
  });

  describe(`logicalPosition 'below'`, () => {
    const event: DropEvent = {
      type: 'drop',
      hoverPosition: 'bottom',
      draggedCollectionId: 2,
      targetInfo: {
        targetCollectionHasChildren: false,
        targetCollectionId: 1,
        targetCollectionIndex: 0,
        targetCollectionLastChild: false,
      },
    };

    expect(resolveLogicalPosition(event.targetInfo, event.hoverPosition)).toBe(
      'below'
    );

    it('works for collection without children', () => {
      expect(resolveNewParentAfterDrop(event, parentsMap)).toStrictEqual({
        collectionId: 2,
        newParentId: null,
        newOrder: 1,
      });
    });
  });

  describe(`logicalPosition 'belowParent'`, () => {
    it('works for collection with children', () => {
      const event: DropEvent = {
        type: 'drop',
        hoverPosition: 'bottom',
        draggedCollectionId: 2,
        targetInfo: {
          targetCollectionHasChildren: false,
          targetCollectionId: 31,
          targetCollectionIndex: 0,
          targetCollectionParentId: 3,
          targetCollectionParentIndex: 2,
          targetCollectionLastChild: true,
        },
      };

      expect(
        resolveLogicalPosition(event.targetInfo, event.hoverPosition)
      ).toBe('belowParent');

      expect(resolveNewParentAfterDrop(event, parentsMap)).toStrictEqual({
        collectionId: 2,
        newParentId: null,
        newOrder: 3,
      });
    });

    it('works for deeply nested collection with children', () => {
      const event: DropEvent = {
        type: 'drop',
        hoverPosition: 'bottom',
        draggedCollectionId: 2,
        targetInfo: {
          targetCollectionHasChildren: false,
          targetCollectionId: 3111,
          targetCollectionIndex: 0,
          targetCollectionParentId: 311,
          targetCollectionParentIndex: 0,
          targetCollectionLastChild: true,
        },
      };

      expect(
        resolveLogicalPosition(event.targetInfo, event.hoverPosition)
      ).toBe('belowParent');

      expect(resolveNewParentAfterDrop(event, parentsMap)).toStrictEqual({
        collectionId: 2,
        newParentId: 31,
        newOrder: 1,
      });
    });
  });
});
