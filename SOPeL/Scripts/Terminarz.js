﻿/// <reference path="jquery-3.1.1.js" />


$(document).ready(function () {

    //wczytanie elementów do zmiennej daje lepszą wydajność, gdyż tylko raz wyszukujemy po id
    var loaderKontener = $("#loader-kontener");
    var wyborDatyTerminarz = $("#wybor-daty-terminarz");
    var dataRezerwacji = $('#wybor-daty-terminarz').val();
    var $siatkaTerminarzaKontener = $('#siatka-terminarza-kontener');
    var $PrzychodniaBodyKontener = $('#PrzychodniaBodyKontener');

    var terminarzDataKontener = $("#terminarzDataKontener");
    var czasTrwaniaWizyty = $("#term_czas_wiz");

    var kartaRezerwacjiWizytyKontener = $("#kartaRezerwacjiWizytyKontener");
    var menu = $("#menu");


    $siatkaTerminarzaKontener.css({
        "height": "100%",
        "visibility": "visible"
    });
    var oknoOpcjiTerminarza = {
        draggable: true,
        hide: { effect: "fade", duration: 250 },
        show: { effect: "fade", duration: 250 },
        resizable: false,
        autoOpen: false,
        width: "500px",
        title: "Opcje terminarza"
    };

    var oknoIndywidualnegoGrafika = {
        draggable: true,
        hide: { effect: "fade", duration: 250 },
        show: { effect: "fade", duration: 250 },
        resizable: false,
        autoOpen: false,
        title: "Zarządzanie godzinami pracy"
    };

    //--------------------------------- WYBÓR DATY -------------------------------------------------------------------------------------------------



    wyborDatyTerminarz.change(function () {
        pobierzTerminarz();
    });

    function pobierzTerminarz() {
        dataRezerwacji = wyborDatyTerminarz.val();

        var wzor = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
        var parts = dataRezerwacji.split('-');

        if (!wzor.test(dataRezerwacji)) {
            alert("Wybierz datę z kalendarza");
            $siatkaTerminarzaKontener.slideUp(500);
            return;
        }
        $.ajax({
            url: '/Terminarz/pobierzTerminarz',
            data: {
                wybranaData: dataRezerwacji
            },
            success: function (response) {
                $siatkaTerminarzaKontener.fadeOut(300, function myfunction() {
                    $siatkaTerminarzaKontener.html(response);
                });
                $siatkaTerminarzaKontener.fadeIn(300);
            },
            error: function () {
                alert("Błąd połączenia z serwerem!");

                $siatkaTerminarzaKontener.fadeOut(300, function myfunction() {
                    $siatkaTerminarzaKontener.html("");
                });
            }
        });
    }


    //--------------------------------- END WYBÓR DATY -------------------------------------------------------------------------------------------------



    //--------------------------------- OPCJE TERMINARZA -------------------------------------------------------------------------------------------------
    var opcjeTerminarzaKontener = $('#opcje-terminarza-kontener');
    var idywidualnyGrafik = $("#term_indw_graf_panel");
    var indwGrafCheckbox = $("#term_indw_graf");
    var ogolnyGrafik = $("#term_ogolny_graf_panel");
    var ogolnyGrafikInputs = $("#term_ogolny_graf_panel input");

    $(".opcje-terminarza-btn").click(function () {
        loaderKontener.switchClass("ukryty", "widoczny", 150, "swing");
        $.ajax({
            url: '/Terminarz/PobierzOpcjeTerminarza',
            type: "POST",
            success: function (response) { //resposne to słownik sparsowany do jsona, klucz to nazwa opcji w bazie
                loaderKontener.switchClass("widoczny", "ukryty", 150, "swing");

                //ładowanie wartości opcji odczytanych z bazy do formularza opcji terminarza
                for (opcja in response) {
                    $("#" + response[opcja].Nazwa).val(response[opcja].Wartosc);
                }

                //jeżeli włączona jest opcja indywidualnego grafika to ukryj ogolny grafik i pokaż ust indywidualnych grafików
                if (response['term_indw_graf'] === '1') {
                    indwGrafCheckbox.attr("checked", true);
                }
                else {
                    indwGrafCheckbox.attr("checked", false);
                }
                PrzelaczIndywidualnyGrafik(indwGrafCheckbox);
                opcjeTerminarzaKontener.css("display", "flex");
            },
            error: function () {
                alert("Błąd połączenia z serwerem!");
                loaderKontener.switchClass("widoczny", "ukryty", 150, "swing");
            }
        });
    });

    //Kontrola wartości wpisywanych przez użytkownika
    czasTrwaniaWizyty.keyup(function () {
        if ($(this).val().length > 1 && $(this).val().substring(0, 1) === '0') {//jeżeli poda zero na początku to wycina zero i zostawia pozostałe cyfry
            $(this).val($(this).val().substring(1));
        }
        else if ($(this).val() > 60) {// jeżeli wpisze wartość większą niż 60 to ustawi 60
            $(this).val('60');
        }
        else if ($(this).val() < 1) {// jeżeli wpisze wartość mniejszą niż 1 to ustawi 0
            $(this).val('0');
        }
    });
    czasTrwaniaWizyty.focusout(function () {
        if ($(this).val().trim() === '' || $(this).val() < 1) {//jeżeli nic nie wpisze, wpisze 0 lub wpisze coś innego niż cyfra to wstawi 1
            $(this).val('1');
        }
    });

    //Zmiana opcji z grafiku przychodni na osobne grafiki dla każdego pracownika
    indwGrafCheckbox.change(function () {
        PrzelaczIndywidualnyGrafik(this);
    });

    $("#opcje-terminarza-zapisz-button").click(function () {
        loaderKontener.switchClass("ukryty", "widoczny", 150, "swing");
        var dict = new Object();
        $("#opcje-terminarza-okno input[id^='term']").each(function (i, val) {// $("#opcje-terminarza-okno input[id^='term']") pobiera wszystkie inputy z okna terminarza których id rozpoczyna się od term, czyli są to opcje terminarza w bazie
            dict[$(this).attr("id")] = $(this).val();
        });
        $.ajax({
            url: "/Terminarz/ZapiszOpcjeTerminarza",
            type: "POST",
            data: {
                opcj: dict
            },
            success: function (response) {
                loaderKontener.switchClass("widoczny", "ukryty", 150, "swing");
                ZamknijOkno(opcjeTerminarzaKontener);
                pobierzTerminarz();
            },
            error: function (response) {
                loaderKontener.switchClass("widoczny", "ukryty", 150, "swing");
                alert(response);
            }
        });
    });

    $("#opcje-terminarza-anuluj-button").click(function () {
        if (confirm("Czy na pewno chcesz anulować wprowadzone zmiany?")) {
            ZamknijOkno(opcjeTerminarzaKontener);
        }
    });

    function PrzelaczIndywidualnyGrafik(checkbox) {
        if ($(checkbox).is(':checked')) {
            $(checkbox).val("1");//value ustawiany jest po to, aby zapisać stan opcji do bazy
            idywidualnyGrafik.css("display", "block");
            ogolnyGrafikInputs.each(function () {
                $(this).prop("disabled", true);
            });
        }
        else {
            $(checkbox).val("0");//value ustawiany jest po to, aby zapisać stan opcji do bazy
            idywidualnyGrafik.css("display", "none");
            ogolnyGrafikInputs.each(function () {
                $(this).prop("disabled", false);
            });
        }
    }

    function ZamknijOkno(okienko) {
        okienko.css("display", "none");
    }
    //--------------------------------- END OPCJE TERMINARZA -------------------------------------------------------------------------------------------------

    //--------------------------------- OBSŁUGA KLIKANIA OPCJE TERMINARZA -------------------------------------------------------------------------------------------------

    //Przeniesione bezpośrednio do siatki terminarza

    $PrzychodniaBodyKontener.on('dblclick', '.wolny-termin', function () { //dzięki zastosowaniu takiej formy (delegat) zdarzenia działają również w elementach ładowanych przez AJAX
        var splitId = $(this).attr("id").split("-");
        var idLekarza = splitId[0];
        var godzinaRezerwacji = splitId[1];

        $.ajax({
            url: "/Terminarz/pokazOknoRezerwacji",
            type: 'POST',
            data: {
                dataRez: $('#wybor-daty-terminarz').val(),
                idLek: idLekarza,
                godzRez: godzinaRezerwacji
            },
            success: function (response) {
                $("#kartaRezerwacjiWizytyKontener").html(response);
                $("#kartaRezerwacjiWizytyKontener").css("display", "flex");
            },
            error: function () { alert("Error"); }
        });

        //$(this).magnificPopup({
        //    type: 'ajax',
        //    ajax: {
        //        settings: {
        //            url: '/Terminarz/pokazOknoRezerwacji',
        //            type: 'POST',
        //            data: {
        //                dataRez: $('#wybor-daty-terminarz').val(),
        //                idLek: idLekarza,
        //                godzRez: godzinaRezerwacji
        //            }
        //        }
        //    },
        //    closeBtnInside: false,
        //    showCloseBtn: false,
        //    modal: true,
        //    prependTo: $("#kartaRezerwacjiWizytyKontener")
        //});

        //$(this).magnificPopup('open');
    });

    $PrzychodniaBodyKontener.on('click', '#zamknijOknoRezerwacjiButton', function () {//dzięki zastosowaniu takiej formy (delegat) zdarzenia działają również w elementach ładowanych przez AJAX
        if (confirm("Na pewno zamknąć okno rezerwacji?")) {
            $("#kartaRezerwacjiWizytyKontener").css("display", "none");
        }
    });

    $PrzychodniaBodyKontener.on("dblclick", '.kafelekRezerwacji', function () {
        var id = $(this).data("idrez");
        EdytujRezerwacje(id);
    });

    $PrzychodniaBodyKontener.on("click", '.edytuj-rezerwacje-btn', function () {
        var id = $(this).data("idrez");
        EdytujRezerwacje(id);
    });

    $PrzychodniaBodyKontener.on('click', '.usun-rezerwacje-btn', function (event) {//dzięki zastosowaniu takiej formy (delegat) zdarzenia działają również w elementach ładowanych przez AJAX
        var id = $(this).data("idrez");
        usunRezerwacje(id);
    });

    function EdytujRezerwacje(idRezerwacji) {
        $("#kartaRezerwacjiWizytyKontener").css("display", "flex");
        $.ajax({
            url: "/Terminarz/EdytujRezerwacje",
            type: 'POST',
            data: {
                idRez: idRezerwacji
            },
            success: function (response) {
                $("#kartaRezerwacjiWizytyKontener").html(response);
            },
            error: function () { alert("Error"); }
        });
    }

    function usunRezerwacje(idRezerwacji) {
        console.log();
        if (confirm("Czy na pewno usunąć wybraną rezerwację?")) {
            $.ajax({
                url: "/Terminarz/UsunRezerwacje",
                type: "POST",
                data: {
                    idRez: idRezerwacji
                },
                success: function (response) {
                    if (response) {
                        alert("Rezerwacja usunięta pomyślnie!");
                        pobierzTerminarz();
                    }
                    else {
                        alert("Błąd przy zapisywaniu rezerwacji!");
                    }
                },
                error: function (response) {
                    alert("Błąd serwera");
                }
            });
        }
    }


    //--------------------------------- END OBSŁUGA KLIKANIA TERMINARZA -------------------------------------------------------------------------------------------------

    //--------------------------------- OBSŁUGA CONTEXT MENU -------------------------------------------------------------------------------------------------

    //Wywołanie okienka z menu,
    $PrzychodniaBodyKontener.on('contextmenu', '.wolny-termin', function (event) {//dzięki zastosowaniu takiej formy (delegat) zdarzenia działają również w elementach ładowanych przez AJAX
        event.preventDefault();// zablokowanie domyślej obsługi zdarzenia ppm

        menu.css({
            "width": "200px",
            "position": "fixed",
            "background": "white",
            "top": event.pageY - $(window).scrollTop(), //od relatywnej pozycji kliknięcia względm dokumentu należy odjąć ilość px o które ktrona jest scrollowana żeby box wyświetlał się w miejscu kliknięcia
            "border-radius": "5px",
            "box-shadow": "1px 1px 5px black",
            "padding": "20px",
            "left": event.pageX
        });

        menu.slideDown(200);
    });



    //--------------------------------- END OBSŁUGA CONTEXT MENU --------------------------------------------------------------------------------------------------


    //--------------------------------- KARTA REZERWACJI ----------------------------------------------------------------------------------------------------------




    $PrzychodniaBodyKontener.on('click', '#zapiszOknoRezerwacjiButton', function (event) {//dzięki zastosowaniu takiej formy (delegat) zdarzenia działają również w elementach ładowanych przez AJAX
        zapiszRezerwacje();
    });

    function zapiszRezerwacje() {
        $.ajax({
            url: "/Terminarz/ZapiszRezerwacje",
            type: "POST",
            data: $("#formularzkartaRezerwacjiWizyty").serialize(),
            success: function (response) {
                if (response.RezultatPozytywny) {
                    console.log(response);
                    alert(response.Komunikat);
                    $('#formularzkartaRezerwacjiWizyty input[type="text"]').each(function () { $(this).val(""); });
                    $("#kartaRezerwacjiWizytyKontener").hide();
                    pobierzTerminarz();
                }
                else {
                    console.log(response);

                    alert(response.Komunikat);
                }
            },
            error: function () { alert("Błąd serwera"); }
        });
    }



    //--------------------------------- END KARTA REZERWACJI ------------------------------------------------------------------------------------------------------






});