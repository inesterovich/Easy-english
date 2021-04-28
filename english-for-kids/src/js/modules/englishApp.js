import { dictionary } from '../lang/langs';
import Card from './card';
import create from '../utils/create';
import * as randFunc from '../utils/unicRandomGenerator';
import * as storage from '../utils/storage';
import playSound from '../utils/playSound';

export default class EnglishApp {
    constructor(base) {
        this.base = base;
        this.dictionary = dictionary;
        this.mode = 'Train';

        this.playGame = {
            status: null,
            button: null,
            index: 0,
            counter: 0,
        };

        this.stats = storage.get('stats') || [];
    }

    clickHandler = (event) => {
        if (event.target.closest('.switch__wrapper')) {
            event.stopPropagation();
            const switchInput = event.target.closest('.switch__wrapper').childNodes[1].childNodes[0];
            const trainLabel = event.target.closest('.switch__wrapper').childNodes[0];
            const playLabel = event.target.closest('.switch__wrapper').childNodes[2];
            if (switchInput.checked) {
                switchInput.checked = false;
                trainLabel.classList.toggle('active');
                playLabel.classList.toggle('active');
                this.mode = 'Train';
                const isCategory = this.layout.main.dataset.isCategory === 'true';
                if (isCategory) {
                    const page = this.layout.main.dataset.categoryName;
                    this.setTrainLayout(page);
                }
            } else {
                switchInput.checked = true;
                trainLabel.classList.toggle('active');
                playLabel.classList.toggle('active');
                this.mode = 'Play';
                const isCategory = this.layout.main.dataset.isCategory === 'true';
                if (isCategory) {
                    const page = this.layout.main.dataset.categoryName;
                    this.setPlayLayout(page);
                }
            }
        } else {
            event.preventDefault();
        }

        if (event.target.dataset.btn === 'menu') {
            event.target.classList.toggle('active');
            this.layout.modals.classList.toggle('active');
            this.layout.body.classList.toggle('unscrollable');
        } else {
            this.layout.modals.classList.remove('active');
            this.menuBtn.classList.remove('active');
            this.layout.body.classList.remove('unscrollable');
        }

        if (event.target.closest('.category__card')) {
            const target = event.target.closest('.category__card');
            const categoryName = target.dataset.category;
            const menuList = this.layout.modals.childNodes[0].childNodes[0].childNodes;
            menuList.forEach((node) => {
                node.childNodes[0].classList.remove('active');
            });
            const menuListTextArray = Array.from(menuList).map((item) => item.innerText);
            const j = menuListTextArray.findIndex((item) => item === categoryName);
            menuList[j].childNodes[0].classList.add('active');
            this.generateLayout(categoryName);
        }

        if (event.target.closest('.menu__item__link')) {
            const linkName = event.target.closest('.menu__item__link').innerText;
            const linkList = event.target.closest('.menu__list').childNodes;
            linkList.forEach((node) => {
                node.childNodes[0].classList.remove('active');
            });

            event.target.closest('.menu__item__link').classList.add('active');
            this.generateLayout(linkName);
        }

        if (this.mode === 'Train') {
            if (event.target.closest('.card')) {
                const { id } = event.target.closest('.card');
                const statObj = this.stats[id];
                statObj.train += 1;
                storage.set('stats', this.stats);
                if (event.target.classList.contains('rotate__card')) {
                    const frontSide = event.target.closest('.front__side');
                    const backSide = event.target.closest('.card').childNodes[1];
                    frontSide.classList.toggle('active');
                    backSide.classList.toggle('active');
                } else {
                    const cardId = event.target.closest('.card').id;
                    const currentCard = this.categoryCards
                        .find((card) => String(card.id) === cardId);

                    const frontSide = event.target.closest('.front__side');

                    if (frontSide) {
                        playSound(currentCard);
                    }
                }
            }
        } else if (this.mode === 'Play') {
            event.preventDefault();
            event.stopPropagation();
            this.playGameHandler(event);
        }

        if (event.target.dataset.tableHeader) {
            const { field } = event.target.dataset;
            const { sortOrder } = event.target.dataset;

            this.generateStatsLayout(event.target, field, sortOrder);
        }

        if (event.target.dataset.action === 'reset') {
            this.stats = [];
            this.generateStatsData();

            storage.set('stats', this.stats);
            this.generateStatsLayout(null, 'name', true);
        }

        if (event.target.dataset.action === 'repeat') {
            this.setRepeatLayout();
        } else {
            this.layout.header.childNodes[2].classList.remove('locked');
        }
    }

    mouseLeaveHandler = (event) => {
        const card = event.target.closest('.card');
        const backSide = event.target;
        const frontSide = card.childNodes[0];

        frontSide.classList.toggle('active');
        backSide.classList.toggle('active');
    }

    generateLayout(page) {
        if (page === 'main' || page === 'Main') {
            const mainContent = this.layout.main.childNodes;
            while (mainContent.length > 0) {
                mainContent.forEach((item) => item.remove());
            }

            this.categoriesHtml = [];
            this.categories.forEach((categoryName, index) => {
                const src = this.categoriesSrc[index];

                const categoryCard = create('div', 'category__card',
                    [create('img', 'category__img', null, null, ['src', src]),
                        create('h3', 'category__name', `${categoryName}`, null)],
                    null, ['category', `${categoryName}`]);
                this.layout.main.appendChild(categoryCard);
                this.categoriesHtml.push(categoryCard);
            });

            this.layout.main.classList.remove('stats');
        }

        if (page === 'stats' || page === 'Stats') {
            this.generateStatsLayout(null, 'name', true);
            delete this.layout.main.dataset.categoryName;
        }

        if (this.categories.includes(page)) {
            if (this.mode === 'Train') {
                this.setTrainLayout(page);
            } else if (this.mode === 'Play') {
                this.setPlayLayout(page);
            }

            this.layout.main.dataset.isCategory = 'true';
            this.layout.main.dataset.categoryName = page;
            this.layout.main.classList.remove('stats');
        } else {
            this.layout.main.dataset.isCategory = 'false';
        }
    }

    generateStatsLayout(target, field, sortOrder) {
        // eslint-disable-next-line consistent-return
        function sortByfieldNane(fieldName, sortingOrder) {
            if (fieldName === 'correctPercent') {
                if (sortingOrder === true) {
                    return (a, b) => (Number(a[fieldName]) > Number(b[fieldName]) ? 1 : -1);
                }
                return (a, b) => (Number(a[fieldName]) < Number(b[fieldName]) ? 1 : -1);
            } if (fieldName !== 'correctPercent') {
                if (sortingOrder === true) {
                    return (a, b) => (a[fieldName] > b[fieldName] ? 1 : -1);
                }
                return (a, b) => (a[fieldName] < b[fieldName] ? 1 : -1);
            }
        }

        const mainContent = this.layout.main.childNodes;
        while (mainContent.length > 0) {
            mainContent.forEach((item) => item.remove());
        }

        const buttons = create('div', 'statsButtons', [
            create('button', 'hard__words_button', 'Repeat dificcult words', null, ['type', 'button'], ['action', 'repeat']),
            create('button', 'resetButton', 'Reset', null, ['type', 'button'], ['action', 'reset']),
        ]);
        const header = create('tr', 'table__header',
            [
                create('th', 'name', 'name', null, ['tableHeader', 'true'], ['field', 'name']),
                create('th', 'translate', 'translate', null, ['tableHeader', 'true'], ['field', 'translate']),
                create('th', 'category', 'category', null, ['tableHeader', 'true'], ['field', 'category']),
                create('th', 'train', '', null, ['tableHeader', 'true'], ['field', 'train']),
                create('th', 'play', '', null, ['tableHeader', 'true'], ['field', 'play']),
                create('th', 'correct', '', null, ['tableHeader', 'true'], ['field', 'correctPercent']),
                create('th', 'errors', '', null, ['tableHeader', 'true'], ['field', 'errors']),
            ]);

        const thead = create('thead', 'thead', header);
        const tbody = create('tbody', 'tbody', null);

        const statsArray = [];

        this.dictionary.forEach((word) => {
            const statsObj = {
                id: word.id,
                name: word.en,
                translate: word.ru,
                category: word.category,
                train: this.stats[word.id].train,
                play: this.stats[word.id].play,
                errors: this.stats[word.id].errors,
                correctPercent: this.stats[word.id].correctPercent,
            };

            statsArray.push(statsObj);
        });

        let targetIndex = null;
        let innerSortOrder = sortOrder;
        if (target) {
            const childs = header.childNodes;
            targetIndex = 0;

            while (target.dataset.field !== childs[targetIndex].dataset.field) {
                targetIndex += 1;
            }

            if (!target.dataset.sortOrder) {
                for (let i = 0; i < childs.length; i += 1) {
                    if (i === targetIndex) {
                        childs[i].dataset.sortOrder = true;
                    } else {
                        delete childs[i].dataset.sortOrder;
                    }
                }

                innerSortOrder = true;
            } else if (target.dataset.sortOrder === 'true') {
                innerSortOrder = false;
            } else if (targetIndex.dataset.sortOrder === 'false') {
                innerSortOrder = true;
            }
        } else {
            header.childNodes[0].dataset.sortOrder = true;
        }

        statsArray.sort(sortByfieldNane(field, innerSortOrder));

        const difficulties = statsArray.slice().filter((statsObj) => statsObj.errors !== 0);

        if (difficulties.length !== 0) {
            this.difficultWords = difficulties.slice().sort(sortByfieldNane('errors', true));
            this.difficultWords.reverse();
            if (this.difficultWords.length > 8) {
                this.difficultWords = this.difficultWords.slice(0, 8);
            }
            this.difficultWords = this.difficultWords.map((statsObj) => statsObj.id);
        } else {
            this.difficultWords = [];
        }

        if (targetIndex > 2) {
            statsArray.reverse();
        }

        statsArray.forEach((statsObj) => {
            const html = create('tr', 'stats__row',
                [
                    create('td', 'td__name', `${statsObj.name}`),
                    create('td', 'td__translate', `${statsObj.translate}`),
                    create('td', 'td__category', `${statsObj.category}`),
                    create('td', 'td__train', `${statsObj.train}`),
                    create('td', 'td__play', `${statsObj.play}`),
                    create('td', 'td__corrects', `${statsObj.correctPercent}`),
                    create('td', 'td__corrects', `${statsObj.errors}`),

                ]);

            tbody.appendChild(html);
        });

        const table = create('table', 'stats',
            [thead,
                tbody,
            ], null);

        this.layout.main.appendChild(buttons);
        this.layout.main.appendChild(table);
        this.layout.main.classList.add('stats');
    }

    setTrainLayout(page) {
        const mainContent = this.layout.main.childNodes;
        while (mainContent.length > 0) {
            mainContent.forEach((item) => item.remove());
        }

        const categoryArray = this.dictionary.filter((wordObj) => wordObj.category === page)
            .map((item) => new Card(item, this.base).init());

        const randArray = Array.from(randFunc.generateSet(0, categoryArray.length))
            .map((item) => categoryArray[item]);

        this.categoryCards = randArray;

        this.categoryCards.forEach((card) => {
            card.html.classList.remove('play');
            this.layout.main.appendChild(card.html);
            const backSide = card.html.childNodes[1];
            backSide.addEventListener('mouseleave', this.mouseLeaveHandler);
        });
    }

    setPlayLayout(page) {
        const mainContent = this.layout.main.childNodes;
        while (mainContent.length > 0) {
            mainContent.forEach((item) => item.remove());
        }

        const categoryArray = this.dictionary.filter((wordObj) => wordObj.category === page)
            .map((item) => new Card(item, this.base).init());

        const randArray = Array.from(randFunc.generateSet(0, categoryArray.length))
            .map((item) => categoryArray[item]);

        this.categoryCards = randArray;

        this.categoryCards.forEach((card) => {
            card.html.classList.add('play');
            this.layout.main.appendChild(card.html);
        });

        this.playGame.coins = create('div', 'coin__section');
        this.layout.main.prepend(this.playGame.coins);

        this.playGame.button = create('button', 'game__button', 'Start Game', this.layout.main);
    }

    setRepeatLayout() {
        const mainContent = this.layout.main.childNodes;
        while (mainContent.length > 0) {
            mainContent.forEach((item) => item.remove());
        }
        this.layout.main.classList.remove('stats');

        const categoryArray = this.difficultWords
            .map((id) => new Card(this.dictionary[id], this.base).init());

        this.categoryCards = categoryArray;

        this.categoryCards.forEach((card) => {
            card.html.classList.remove('play');
            this.layout.main.appendChild(card.html);
            const backSide = card.html.childNodes[1];
            backSide.addEventListener('mouseleave', this.mouseLeaveHandler);
        });
        this.layout.header.childNodes[2].classList.add('locked');
        this.layout.main.dataset.isCategory = true;
    }

    playGameHandler = (event) => {
        if (event.target === this.playGame.button) {
            if (this.playGame.status === null) {
                this.playGame.status = 'game';
                this.playGame.button.innerText = 'Repeat';
                this.playGame.randNumbers = Array.from(
                    randFunc.generateSet(0, this.categoryCards.length),
                );
                this.playGame.counter = this.categoryCards.length;
            }
            const i = this.playGame.randNumbers[this.playGame.index];

            this.playGame.currentCard = this.categoryCards[i];
            playSound(this.playGame.currentCard);
        }

        if (event.target.closest('.card') && this.playGame.status) {
            const cardId = Number(event.target.closest('.card').id);
            const correctCardId = Number(this.playGame.currentCard.id);

            if (cardId === correctCardId) {
                if (this.playGame.index + 1 < this.categoryCards.length) {
                    this.stats[cardId].play += 1;
                    storage.set(this.stats);
                    this.playGame.index += 1;
                    const audioUrl = './audio/correctcard.mp3';
                    const audio = new Audio(audioUrl);
                    this.playGame.currentCard.html.classList.add('disabled');
                    const i = this.playGame.randNumbers[this.playGame.index];
                    this.playGame.currentCard = this.categoryCards[i];
                    audio.play();
                    audio.addEventListener('ended',
                        () => playSound(this.playGame.currentCard));
                    const coinSrc = './icons/dollartrue.svg';
                    create('img', 'coin', null, this.playGame.coins, ['src', `${coinSrc}`]);
                } else {
                    this.playGame.currentCard.html.classList.add('disabled');
                    const result = this.categoryCards.length === this.playGame.counter ? 'Success' : 'Failure';
                    this.playGame.button.remove();
                    if (result === 'Success') {
                        const src = './icons/succesgame.png';
                        const window = create('div', 'window', create('div', 'result',
                            [
                                create('img', 'result__img', null, null, ['src', `${src}`]),
                                create('p', 'result__text', 'You won the game!'),
                            ]));
                        this.layout.body.appendChild(window);
                        const audioSrc = './audio/sucessgame.mp3';
                        const audio = new Audio(audioSrc);
                        audio.play();

                        audio.addEventListener('ended', () => {
                            window.remove();
                            this.playGame.index = 0;
                            this.playGame.status = null;
                            this.playGame.counter = null;
                            this.generateLayout('main');
                        });
                    } else if (result === 'Failure') {
                        const mistakes = this.categoryCards.length - this.playGame.counter;
                        const src = './icons/failedgame.png';
                        const ending = mistakes > 1 ? 'es' : 'e';
                        const window = create('div', 'window', create('div', 'result',
                            [
                                create('img', 'result__img', null, null, ['src', `${src}`]),
                                create('p', 'result__text', `Sorry, you lost.
                                 You made ${mistakes} mistak${ending}.`),
                            ]));
                        this.layout.body.appendChild(window);

                        const audioSrc = './audio/failedgame.mp3';
                        const audio = new Audio(audioSrc);
                        audio.play();

                        audio.addEventListener('ended', () => {
                            window.remove();
                            this.playGame.index = 0;
                            this.playGame.status = null;
                            this.playGame.counter = null;
                            this.generateLayout('main');
                        });
                    }
                }
            } else if (cardId !== correctCardId) {
                this.playGame.counter -= 1;
                this.stats[correctCardId].play += 1;
                this.stats[correctCardId].errors += 1;
                storage.set('stats', this.stats);
                const audioUrl = './audio/wrongcard.mp3';
                const audio = new Audio(audioUrl);
                audio.play();
                const coinSrc = './icons/dollarfalse.svg';
                create('img', 'coin', null, this.playGame.coins, ['src', `${coinSrc}`]);
            }
        }
    }

    generateSkin() {
        this.layout = {
            body: null,
            header: null,
            main: null,
            footer: null,
            modals: null,
        };

        this.layout.body = document.querySelector('body');
        this.menuBtn = create('div', 'menu__button',
            [create('span', '', ''), create('span', '', ''), create('span', '', '')], null, ['btn', 'menu']);

        const modeButton = create('div', 'switch__wrapper', [
            create('label', 'switcher__label switcher__train active', 'Train', null, ['for', 'checkbox']),
            create('div', 'switcher',
                [
                    create('input', 'switcher__checkbox', null, null, ['type', 'checkbox'], ['id', 'checkbox']),
                    create('span', 'switch__button'),
                ]),
            create('label', 'switcher__label switcher__play', 'Play', null, ['for', 'checkbox']),
        ], null);

        this.layout.header = create('header', 'header',
            [this.menuBtn, create('h1', 'title', 'Easy English'), modeButton], null);
        this.layout.main = create('main', 'main', null, null);
        const footerContent = [
            create('div', 'copyright__wrapper', [create('p', 'copyright', '&copy 2020, Ilya Nesterovich'),
                create('a', 'github__link', 'Visit GitHub', null,
                    ['href', 'https://github.com/inesterovich/'])]),
            create('div', 'rsschool__link__wrapper',
                create('a', 'rsschool__link', create('img', 'rsschool__logo', null, null, ['src', './icons/rs_school_js.svg']), null, ['href', 'https://rs.school/js/']))];
        this.layout.footer = create('footer', 'footer', footerContent, null);

        this.categories = new Set();
        this.categoriesSrc = [];

        dictionary.forEach((wordObj) => {
            if (!this.categories.has(wordObj.category)) {
                this.categories.add(wordObj.category);
                this.categoriesSrc.push(wordObj.src);
            }
        });

        this.generateStatsData();

        this.categories = Array.from(this.categories);

        const menuLinks = ['Main', ...this.categories, 'Stats'];
        const menuLinksHtml = [];
        menuLinks.forEach((linkName) => {
            const linkItem = create('li', 'menu__item', create('a', 'menu__item__link', linkName, null, ['href', './']), null);
            menuLinksHtml.push(linkItem);
        });

        menuLinksHtml[0].childNodes[0].classList.add('active');

        this.layout.modals = create('section', 'modals',
            create('nav', 'main__nav', create('ul', 'menu__list',
                menuLinksHtml, null), null),
            null);

        const pageWrapper = create('div', 'page__wrapper',
            [this.layout.header, this.layout.main, this.layout.footer, this.layout.modals],
            null);

        this.layout.body.prepend(pageWrapper);

        return this;
    }

    generateStatsData() {
        if (this.stats.length === 0) {
            for (let i = 0; i < this.dictionary.length; i += 1) {
                const name = this.dictionary[i].en;
                const { id } = this.dictionary[i];
                this.stats[i] = {
                    id,
                    name,
                    train: 0,
                    play: 0,
                    errors: 0,

                    get correctPercent() {
                        let result = ((this.play - this.errors) / this.play) * 100;
                        if (Number.isNaN(result)) result = 0;
                        return result.toFixed(2);
                    },
                };
            }
        } else if (this.stats.length !== 0) {
            this.stats = storage.get('stats');
        }
    }

    init() {
        this.generateSkin();
        this.generateLayout('main');
        document.addEventListener('click', this.clickHandler);

        return this;
    }
}
