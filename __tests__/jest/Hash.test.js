const Hash = require('../../src/cryptography/Hash');

test('generate hashes and make sure they compare accurately', () => {
    for (let i = 0; i < 5; i++) {
        const phrase = `arbitrary phrase ${i + 1}`
        const hashed = Hash.generate(phrase);

        expect(Hash.compare(phrase, hashed)).toBeTruthy();
    }
});