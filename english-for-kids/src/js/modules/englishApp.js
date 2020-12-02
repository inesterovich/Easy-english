import {dictionary}  from '../lang/langs'
import Card from './card'
import create from '../utils/create';
import * as randFunc from '../utils/unicRandomGenerator';

console.log(randFunc);
 export class EnglishApp {

    constructor(base) {
        this.base = base;
        this.dictionary = dictionary;
        
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
        
      } else {
          switchInput.checked = true;
          trainLabel.classList.toggle('active');
          playLabel.classList.toggle('active');
      }


    } else {
        event.preventDefault()
    };
         if (event.target.dataset.btn === 'menu') {
             event.target.classList.toggle('active');
             this.layout.modals.classList.toggle('active')
         } else {
            this.layout.modals.classList.remove('active');
            this.menuBtn.classList.remove('active');
         }

         if (event.target.closest('.category__card')) {
        const target = event.target.closest('.category__card');
            const categoryName = target.dataset.category;
            this.generateLayout(categoryName);
         }

         if (event.target.closest('.menu__item__link')){
             const linkName = event.target.closest('.menu__item__link').innerText;
             /* Мне надо удалить все ссылки из меню и добавить активный класс */
             const linkList = event.target.closest('.menu__list').childNodes;
             debugger;
             linkList.forEach(node => {
                 node.childNodes[0].classList.remove('active');
             })

             event.target.closest('.menu__item__link').classList.add('active');
             this.generateLayout(linkName);
         }


         if (event.target.closest('.card')) {
            if (event.target.classList.contains('rotate__card')){
                let frontSide = event.target.closest('.front__side'); 
                let backSide = event.target.closest('.card').childNodes[1];
                frontSide.classList.toggle('active');
                backSide.classList.toggle('active');     
            } else {
                const cardId = event.target.closest('.card').id;
                const currentCard = this.categoryCards.find(card => card.id == cardId);

               const frontSide = event.target.closest('.front__side');
    
                if (frontSide) {
                    const audio = currentCard.audio;

                    if (audio) {
                        audio.currentTime = 0;
                        audio.play();
                    } else {
                        console.log('sound not found');
                    }
                }

               
            }


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
      
            let mainContent = this.layout.main.childNodes;
            while(mainContent.length > 0) {
                mainContent.forEach(item => item.remove());
            }

            this.categoriesHtml = [];
           this.categories.forEach((categoryName, index) => {
               const src = this.categoriesSrc[index];
               
                const categoryCard = create('div', 'category__card',
                 [create('img', 'category__img', null, null, ['src', src]),
                create('h3', 'category__name', `${categoryName}`, null)]
                 , null, ['category', `${categoryName}`]);
                 this.layout.main.appendChild(categoryCard);
                 this.categoriesHtml.push(categoryCard)
            })


        }

        if (this.categories.includes(page)) {

            let mainContent = this.layout.main.childNodes;
            while(mainContent.length > 0) {
                mainContent.forEach(item => item.remove());
            }

            /* Мне в любом случае надо что-то отфильтровать.
            1. А если фильтровать через константу?
            
            */
           const categoryArray = this.dictionary.filter(wordObj => wordObj.category === page)
           .map(item => new Card(item, this.base).init())

            const randArray = Array.from(randFunc.generateSet(0, categoryArray.length))
            .map(item => categoryArray[item]);
            
            this.categoryCards = randArray;
            
        
          

            this.categoryCards.forEach(card => 
                {
                    this.layout.main.appendChild(card.html);
                    const backSide = card.html.childNodes[1];
                    backSide.addEventListener('mouseleave', this.mouseLeaveHandler);
                })
        
        }

     

    

    }

    generateSkin() {

        this.layout = 
        {
        body: null,
        header: null,
        main: null,
        footer: null,
        modals: null,
        };

        let body = document.querySelector('body');
        this.menuBtn = create('div', 'menu__button', 
        [create('span', '', ''), create('span', '', ''), create('span', '', '') ], null, ['btn', 'menu'])

        let modeButton = create('div', 'switch__wrapper', [
            create('label', 'switcher__label switcher__train active', 'Train', null, ['for', 'checkbox']),
            create('div', 'switcher', 
                [
                    create('input', 'switcher__checkbox', null, null,['type', 'checkbox'], ['id', 'checkbox']),
                    create('span', 'switch__button', )
                ]),
            create('label', 'switcher__label switcher__play', 'Play', null, ['for', 'checkbox']),
        ], null);


        this.layout.header = create('header', 'header',
         [this.menuBtn, create('h1', 'title', 'Easy English'), modeButton], null);
        this.layout.main = create('main', 'main', null,null);
        this.layout.footer = create('footer', 'footer', null, null);

        this.categories = new Set();
        this.categoriesSrc = [];

         dictionary.forEach(wordObj => {
            if (!this.categories.has(wordObj.category)) {
                this.categories.add(wordObj.category);
                this.categoriesSrc.push(wordObj.src);
            }
        
             
         })


         this.categories = Array.from(this.categories);
        
         const menuLinks = ['Main', ...this.categories, 'Stats'];
         const menuLinksHtml = [];
         menuLinks.forEach(linkName => {
             const linkItem = create('li', 'menu__item', create('a', 'menu__item__link', linkName, null, ['href', './']), null);
             menuLinksHtml.push(linkItem);
         })

        menuLinksHtml[0].childNodes[0].classList.add('active')
        

       

        this.layout.modals = create('section', 'modals',
         create('nav', 'main__nav', create('ul', 'menu__list', 
       menuLinksHtml, null), null)
         , null);
         
        let pageWrapper = create('div', 'page__wrapper', 
        [this.layout.header, this.layout.main, this.layout.footer, this.layout.modals],
         null);

       

        body.prepend(pageWrapper)
  
        return this;
    }




    init() {
        this.generateSkin();
        this.generateLayout('main')
        document.addEventListener('click', this.clickHandler);
        
        return this;
// Всё, что требуется сделать один раз при создании
    }


    /* 
    Я иду в стиле SPA: всё приложение - одна страница. Есть роутинг. 
    То есть, у меня всё загнано в класс и внутри всё происходит
    
    */
}