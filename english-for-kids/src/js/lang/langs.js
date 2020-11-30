import english from './en';
import russian from './ru';

english.forEach((enObject, index) => {
    
   russian.forEach(ruObject => {
if (ruObject.id === enObject.id ) {
    enObject.ru = ruObject.ru

}

   })


})

/*  Давай-ка пропишем функцию сбора языков, перепишем на map массив и тогда посмотрим, что и куда не лезет. */


export {english as dictionary};

