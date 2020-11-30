import create from '../utils/create';

export default class Card {
    constructor(obj, base) {
        this.id = obj.id;
        this.word = obj[base];
        this.ru = obj.ru;
        this.src = obj.src;
        this.audio = new Audio(obj.audioUrl);
       
    }

    init() {
        const frontSide  = create('div', 'front__side active', 
        [
            create('img', 'word__img', null, null, ['src', this.src]),
             create('h3', 'word__title',this.word, null), 
             create('button', 'rotate__card', 'rotate', null, ['type', 'button'])], null);
        const backSide = create('div', 'back__side', 
        [
            create('img', 'word__img', null, null, ['src', this.src]),
             create('h3', 'word__title word__translate',this.ru, null), 
             ], null);

        this.html = create('section', 'card', [frontSide, backSide], null, ['id', this.id]);
        return this;
    }

    


    /* Id-шник здесь тоже желателен - именно по нему буду считать клики*/
}