window.addEventListener('load', (event) => {
    window.dataLayer = window.dataLayer || [];

    ((events)=>{
        const ctas_tracked = [];
        const ctas_viewed = [];
        const forms_tracked= [];
        const keys = {
            cta:"main_cta",
            form:"main_form",
            social:"social_network"
        }

        const getType = ({node,key,deft}) => {
            const regex = new RegExp(`${key}_(?<type>[\\w_]+)`);
            const match = regex.exec(node.classList.value);
            return match?.groups?.type || deft;
        }

        const getMktFormId = ({form}) => {
            const regex = new RegExp('mktoForm_(?<formId>[\\w_.-]+)');
            const match = regex.exec(form.id);
            return match?.groups?.formId || null;
        }

        const isMktForm = ({form}) => form.id.includes('mktoForm_')

        const isInViewport = (el) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };

        const conversionValueMatrix = [
            {
                value:0,
                test:["test","yopmail","qq"]
            },
            {
                value:25,
                test:["gmail","yahoo","hotmail","live","aol","outlook","orange","laposte","icloud"]
            }
        ]
        const getConversionValue = (email) => {
            if(!email)
                return 0;

            const domain = email.split('@')[1].split('.').slice(-2,-1)?.toString();
            const conversionValue = conversionValueMatrix.reduce((currentValue,{value: testValue,test})=>{
                if(test.includes(domain))
                    return testValue;
                return currentValue
            },500);
            return conversionValue;
        }

        //Event info
        if(events?.pageInfo)
            window.dataLayer.push(events.pageInfo);

        //Event click_main_cta
        document.querySelectorAll('a, button').forEach(element => {
            const cta = element.closest(`.${keys.cta}`) || element.querySelector(`.${keys.cta}`);
            if (cta && !ctas_tracked.includes(cta)) {
                ctas_tracked.push(cta);
                element.addEventListener("click", event => {
                    // event.preventDefault();
                    window.dataLayer.push({
                        event: 'click_main_cta',
                        cta_type: getType({node:cta,key:keys.cta,deft:'default'}),
                        cta_origin: window.location.href,
                        cta_label: cta.innerText.trim()
                    });
                    return true;
                })
            }
        });

        //Event view_main_cta
        const checkVisibleCTAs = () => {
            //load view event only one time and not for .main_cta_header
            const ctas = ctas_tracked.filter(cta => !ctas_viewed.includes(cta) && !cta.classList.contains("main_cta_header"));
            ctas.forEach(cta => {
                if(isInViewport(cta)){
                    ctas_viewed.push(cta);
                    window.dataLayer.push({
                        event: 'view_main_cta',
                        cta_type: getType({node:cta,key:keys.cta,deft:'default'}),
                        cta_origin: window.location.href,
                        cta_label: cta.innerText.trim()
                    });
                }
            })
        }
        document.addEventListener('scroll', checkVisibleCTAs);
        document.addEventListener('resize', checkVisibleCTAs);

        //Event generate_lead
        Array.from(document.getElementsByTagName('form')).forEach(form =>{
            let node = form.closest(`.${keys.form}`) || form.querySelector(`.${keys.form}`);
            if(!node && isMktForm({form})) //auto select marketo form
                node = form;

            if ( node && !forms_tracked.includes(node) ) {
                forms_tracked.push(node);

                form.addEventListener("submit", event => {
                    const formHasAlreadyBeenSubmitted =  form.getAttribute("data-form-submitted")?true:false;
                    const getData = () => ({
                        event: 'generate_lead',
                        form_type: getType({node,key:keys.form,deft:'default'}),
                        form_origin: window.location.href,
                        country: form.querySelector('select[name="country__list_"]')?.value || null,
                        company_size: form.querySelector('select[name="numemployees"]')?.value || null,
                        job_title: form.querySelector('input[name="jobtitle"]')?.value || null,
                        email: form.querySelector('input[name="email"]')?.value || null,
                        phone: form.querySelector('input[name="phone"]')?.value || null,
                        firstname: form.querySelector('input[name="firstname"]')?.value || null,
                        lastname: form.querySelector('input[name="lastname"]')?.value || null,
                        conversion_value: getConversionValue(form.querySelector('input[name="email"]')?.value || null)
                    })

                    const marketoForm = window.MktoForms2?.getForm(getMktFormId({form}));
                    if(marketoForm){
                        if(!formHasAlreadyBeenSubmitted)
                            marketoForm.onSuccess((values,targetPageUrl) =>{
                                window.dataLayer.push(getData());
                            })
                    }else{
                        window.dataLayer.push(getData());
                    }
                    if(!formHasAlreadyBeenSubmitted)
                        form.setAttribute("data-form-submitted", "true");
                })
            }
        })

        //click_social_network
        document.querySelectorAll('a, button').forEach(element => {
            const node = element.closest(`.${keys.social}`) || element.querySelector(`.${keys.social}`);
            if (node) {
                element.addEventListener("click", event => {
                    // event.preventDefault();
                    window.dataLayer.push({
                        event: 'click_social_network',
                        social_network: getType({node,key:keys.social,deft:'n/a'})
                    });
                    return true;
                })
            }
        });

        //login
        document.addEventListener("submit", event => {
            // event.preventDefault();
            const storageKey = "gtm4UserLogged";
            const userLogged = sessionStorage.getItem(storageKey) ? JSON.parse(localStorage.getItem(storageKey)) : null;
            if(!userLogged){
                const form = event.target;
                if (form.getAttribute("name") === "loginForm") {
                    window.dataLayer.push({
                        event: 'login',
                        login_origin: window.location.host
                    });
                    sessionStorage.setItem(storageKey, JSON.stringify(true))
                }
            }
            return true;
        })

    })(window.gtm4)
})
