## Changes

### 1.0.7
- Added unit tests to verify `ping` function works as expected
- Moved all adaptation of the RedisClient prototype to happen at module load time in order to fix sequencing bugs

### 1.0.3
- Replaced `getDefaultHost` function with `defaultHost` property
- Replaced `getDefaultPort` function with `defaultPort` property

### 1.0.2
- Added `.npmignore`
- Renamed `release_notes.md` to `CHANGES.md`
- Updated dependencies

### 1.0.1
- Updated rcc-core dependency

### 1.0.0
- Initial version
- Added `getDefaultHost` and `getDefaultPort` functions to `rcc-redis-adapter` module