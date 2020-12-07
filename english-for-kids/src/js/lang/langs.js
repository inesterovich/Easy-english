import english from './en';
import russian from './ru';

english.forEach((enObject) => {
    russian.forEach((ruObject) => {
        if (ruObject.id === enObject.id) {
            /* Здесь я обьединяю два массива в один,
        мне нужно дабавить в объекты первого некоторые свойства второго.
        По отдельности они мне не нужны - заготовка на случай внезапного добавления ещё 20 языков */
            // eslint-disable-next-line no-param-reassign
            enObject.ru = ruObject.ru;
        }
    });
});

/* Не сообразил, как импортировать через дефолтный экспорт с одновременным переименованием . */
// eslint-disable-next-line import/prefer-default-export
export { english as dictionary };
