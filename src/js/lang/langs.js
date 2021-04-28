import english from './en';
import russian from './ru';

english.forEach((enObject) => {
    russian.forEach((ruObject) => {
        if (ruObject.id === enObject.id) {
            // eslint-disable-next-line no-param-reassign
            enObject.ru = ruObject.ru;
        }
    });
});

// eslint-disable-next-line import/prefer-default-export
export { english as dictionary };
