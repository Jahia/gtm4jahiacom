window.addEventListener('DOMContentLoaded', (event) => {
    window.dataLayer = window.dataLayer || [];
    //Event info
    window.dataLayer.push(window.gtm4.pageInfo);

    //Event click_main_cta
    window.gtm4.cta_types = [
        {name:'main_cta_demo', value:'demo'},
        {name:'main_cta_free_trial', value:'free_trial'},
        {name:'main_cta_contact', value:'contact'},
        {name:'main_cta_ressource', value:'ressource'},
        {name:'main_cta_upgrade', value:'upgrade'},
        {name:'main_cta_webinar', value:'webinar'},
    ]
    document.addEventListener("click", event => {
        const target = event.target;
        const isCtaNode = target.nodeName === 'BUTTON' || target.nodeName === 'A';
        if(isCtaNode){
            const cta = target.closest('.main_cta');
            if (cta) {
                window.dataLayer.push({
                    event: 'click_main_cta',
                    cta_type: window.gtm4.cta_types.find(({name}) => cta.classList.contains(name))?.value || 'default',
                    cta_origin: window.location.href,
                    cta_label: cta.innerText.trim()
                });
            }
        }

    });

    //Event view_main_cta
})
