import {
  resetPortTags,
  addTag,
  removeTag,
  getTagsForPort,
  getPortsForTag,
  hasTag,
  getAllPortTags,
  serializePortTags,
  loadPortTagsFromJson,
} from './portTag';

beforeEach(() => resetPortTags());

describe('addTag / getTagsForPort', () => {
  it('adds a tag to a port', () => {
    addTag(8080, 'web');
    expect(getTagsForPort(8080)).toContain('web');
  });

  it('normalizes tags to lowercase', () => {
    addTag(443, 'HTTPS');
    expect(getTagsForPort(443)).toContain('https');
  });

  it('deduplicates tags', () => {
    addTag(80, 'web');
    addTag(80, 'web');
    expect(getTagsForPort(80)).toHaveLength(1);
  });

  it('returns empty array for unknown port', () => {
    expect(getTagsForPort(9999)).toEqual([]);
  });
});

describe('removeTag', () => {
  it('removes an existing tag', () => {
    addTag(3000, 'dev');
    const result = removeTag(3000, 'dev');
    expect(result).toBe(true);
    expect(getTagsForPort(3000)).toHaveLength(0);
  });

  it('returns false for missing tag', () => {
    expect(removeTag(3000, 'nonexistent')).toBe(false);
  });

  it('cleans up port entry when last tag removed', () => {
    addTag(5000, 'api');
    removeTag(5000, 'api');
    expect(getAllPortTags().find(e => e.port === 5000)).toBeUndefined();
  });
});

describe('getPortsForTag', () => {
  it('returns ports with matching tag', () => {
    addTag(80, 'web');
    addTag(443, 'web');
    addTag(3306, 'db');
    expect(getPortsForTag('web')).toEqual([80, 443]);
  });

  it('returns empty array for unknown tag', () => {
    expect(getPortsForTag('unknown')).toEqual([]);
  });
});

describe('hasTag', () => {
  it('returns true when tag exists', () => {
    addTag(22, 'ssh');
    expect(hasTag(22, 'ssh')).toBe(true);
  });

  it('returns false when tag does not exist', () => {
    expect(hasTag(22, 'web')).toBe(false);
  });
});

describe('serialize / load', () => {
  it('round-trips port tags via JSON', () => {
    addTag(80, 'web');
    addTag(80, 'public');
    addTag(5432, 'db');
    const json = serializePortTags();
    resetPortTags();
    loadPortTagsFromJson(json);
    expect(hasTag(80, 'web')).toBe(true);
    expect(hasTag(80, 'public')).toBe(true);
    expect(hasTag(5432, 'db')).toBe(true);
  });
});
