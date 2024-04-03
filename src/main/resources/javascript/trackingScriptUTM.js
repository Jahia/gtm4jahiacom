/*
         * Retrive ppc querystring values, save in cookie and populate hidden form fields.
         *
         * Updated August 1, 2016 by Digital Pi
         *
         * This script should be placed in the body of the page below the form and before the </body> tag
         * ppcUrlCookiePart1 and ppcUrlCookiePart2 must be called, see bottom of script
         * update ppcUrlCookiePart2 and ppcUrlCookiePart2 to match your querystring and form field names
         *
         */

window.addEventListener('load', (event) => {
    //Leave this as true to always use querystring values if they exist, if no querystring will attempt to get cookie values
    var ppcUseLatestValues = true; //set this to false to use cookie values if they exist (if false, will not check querystring first).

    function isTrafficFromGoogleSearch() {
        var referrer = document.referrer;
        var googleSearchRegex = /https?:\/\/(www\.)?google\./;

        return googleSearchRegex.test(referrer);
    }

    //function to grab params from cookie
    function getCookie(param_name) {
        var i, x, y, cookie = document.cookie.split(";");
        for (i = 0; i < cookie.length; i++) {
            x = cookie[i].substr(0, cookie[i].indexOf("="));
            y = cookie[i].substr(cookie[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == param_name) {
                return unescape(y);
            }
        }
    }

    //function to create cookie
    function setCookie(param_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        //CHANGE DOMAIN BELOW TO MATCH SITE
        var c_value = escape(value) + ((exdays == null) ? "" : "; domain=jahia.com; path=/; expires=" + exdate.toUTCString());
        document.cookie = param_name + "=" + c_value;
    }

    //function to check if cookie exists and, if so, run the setCookie function
    function checkCookie(param_name, param_url_name) {

        var param_value = getCookie(param_name);
        if ((param_value != null && param_value != "" && param_value != "undefined") && ppcUseLatestValues == false) {
            //this means the param name/value pair exists - and we don't want to use latest
        } else {
            //this means the param name/value pair does not exist - so create it
            //grab values from URL
            var pageURL = window.location.search.substring(1);
            var URLVariables = pageURL.split('&');
            for (var i = 0; i < URLVariables.length; i++) {
                var parameterName = URLVariables[i].split('=');
                if (parameterName[0] == param_url_name) {
                    //filter out "#" in case that is in the last URL param
                    param_value = parameterName[1].split("#")[0];
                }
            }

            // Si aucun paramètre UTM n'est présent et que le trafic provient de Google, on ajoute "google" comme valeur de utm_source
            if (param_value == null || param_value == "" || param_value == "undefined") {
                if (param_url_name == "utm_source" && document.referrer) {
                    const organic = ["google","bing"];
                    param_value = document.referrer.split('/')[2]?.split('.')?.slice(-2,-1)?.toString();
                    if(param_value && param_value != ""){
                        const ppcMedium = organic.includes(param_value)?'organic':'referral';
                        setCookie('ppcMedium',ppcMedium, 365);
                        setCookie('ppcCampaign', '', 365);
                        setCookie('ppcAdGroup', '', 365);
                        setCookie('ppcKeyword', '', 365);
                        setCookie('ppcContent', '', 365);
                    }
                }
            }

            if (param_value != "undefined" && param_value != "" && param_value != null) {
                //create cookie
                setCookie(param_name, param_value, 365);
            }
        }
    }


    //function to setup the parameters and save the cookie values
    function ppcUrlCookiePart1() {
        //setup list/array of parameters desired. names on right should match querystring names
        var param_names = new Array(
            'ppcSource;utm_source',
            'ppcMedium;utm_medium',
            'ppcCampaign;utm_campaign',
            'ppcAdGroup;utm_adgroup',
            'ppcKeyword;utm_term',
            'ppcContent;utm_content'
        );


        //loop through all params and create cookie
        for (i = 0; i < param_names.length; i++) {
            var param_object = param_names[i].split(";");//split out the cookie name and url name
            var param_name = param_object[0];
            var param_url_name = param_object[1];
            //start the cookie creation
            checkCookie(param_name, param_url_name);
        }
    }


    //function to grab cookie params
    function mGetCookie(param_name) {
        var i, x, y, cookie = document.cookie.split(";");
        for (i = 0; i < cookie.length; i++) {
            x = cookie[i].substr(0, cookie[i].indexOf("="));
            y = cookie[i].substr(cookie[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == param_name) {
                return unescape(y);
            }
        }
    }

    //function to check if cookie exists and, if so, fill out the corresponding form fields
    function mCheckCookie(param_name, param_field_name) {
        var param_value = mGetCookie(param_name);
        if (param_value != null && param_value != "" && param_value != "undefined") {
            try {
                var obj1 = document.getElementsByName(param_field_name);
                obj1[0].value = param_value;
                return true;
            } catch (err) {
                return false;
            }
        }
        return false;
    }

    function getCookiesStartingWith(prefix) {
        const regex = new RegExp(`(^|;\\s*)(${prefix}[^=]+)=([^;]+)`, 'g');
        const cookies = {};
        document.cookie.replace(regex, (match, p1, p2, p3) => {
            cookies[p2] = p3;
            return match; // Cette valeur de retour n'est pas utilisée ici, mais est nécessaire pour la fonction replace
        });
        return cookies;
    }


    //function to setup parameters and begin cookie value insertion into marketo form
    function ppcUrlCookiePart2() {
        //setup list/array of parameters desired. names on right should match hidden form field names
        var param_names = new Array(
            'ppcSource;utm_source',
            'ppcMedium;utm_medium',
            'ppcCampaign;utm_campaign',
            'ppcAdGroup;utm_adgroup',
            'ppcKeyword;utm_term',
            'ppcContent;utm_content',
            '_ga;ga_client_id'
        );

        //loop through all params and create cookie
        for (i = 0; i < param_names.length; i++) {
            var param_object = param_names[i].split(";");//split out the cookie name and url name
            var param_name = param_object[0];
            var param_field_name = param_object[1];
            //start the cookie creation
            mCheckCookie(param_name, param_field_name);
        }

        //
        const gaCookies = getCookiesStartingWith('_ga_');
        const firstGaCookieValue = Object.values(gaCookies)[0];
        try {
            var obj1 = document.getElementsByName("ga_session_id");
            obj1[0].value = firstGaCookieValue;
            return true;
        } catch (err) {
            return false;
        }

    }

    //ppcUrlCookiePart1 will grab values from the querystring and save them in cookies
    ppcUrlCookiePart1();

    //ppcUrlCookiePart2 will retrive values from the cookies and populate the hidden form fields - should be in the onload
    try {
        //attempt for Marketo form
        MktoForms2.whenReady(function (form) {
            ppcUrlCookiePart2();
        });
    } catch (err) {
        //if error on Marketo form, try loading for regular form.
        ppcUrlCookiePart2();
    }
})
