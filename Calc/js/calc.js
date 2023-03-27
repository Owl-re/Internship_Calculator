// スタイルシート変更処理
function chgStyle() {
    let pageObj = document.getElementById('pageStyle');

    if (document.getElementById('btnPage').textContent == 'i') {
        pageObj.href = 'css/calc_chrome_google.css';
        document.getElementById('btnPage').textContent = 'g';
    }
    else {
        pageObj.href = 'css/calc_chrome_ios.css';
        document.getElementById('btnPage').textContent = 'i';
    }
}

// 入力項目追記処理
function inpAppend(id, value) {
    document.getElementById(id).value += value;
}

// 入力項目置き換え処理
function inpUpdate(id, value) {
    document.getElementById(id).value = value;
}

// オールクリアボタン押下処理
function pressClear() {
    // 入力エリアを0に初期化する
    inpUpdate('inpMain', '0');
    inpUpdate('inpOperator', '');
    inpUpdate('inpFormula', '');
}

// クリアボタン押下処理
// 今回は仕様しない
function press_Clear() {
    // 直前に演算子ボタンを押下していないとき
    if (display('inpOperator') == '') {
        inpUpdate('inpMain', '0');
    }
}

// 表示取得処理
function display(id) {
    return document.getElementById(id).value;
}

// バックスペースボタン押下処理
function pressBackspace() {
    // 直前に演算子ボタンを押下していないとき
    if (display('inpMain') != '0' && display('inpOperator') == '') {
        endClear('inpMain');
    }
    // 数字が消えたとき
    if (display('inpMain') == '' || display('inpMain') == '－') {
        inpUpdate('inpMain', '0');
    }
}

// 計算式から最後に入力した演算子の位置を取得
function last(value) {
    return display('inpFormula').lastIndexOf(value);
}

// 末尾削除処理
function endClear(id) {
    inpUpdate(id, display(id).slice(0, -1));
}

// 計算実行処理
function slove() {
    let formula = display('inpFormula');
    // 文字列から数式に変換
    formula = formula.replace(/e－/g, '/10**');
    formula = formula.replace(/e/g, '*10**');
    formula = formula.replace(/÷/g, '/');
    formula = formula.replace(/×/g, '*');
    formula = formula.replace(/－/g, '-');
    formula = formula.replace(/＋/g, '+');
    // 数式を計算
    formula = eval(formula);
    inpUpdate('inpMain', formula);
    // Error(NaN)であるとき
    if (String(formula).endsWith('N') == true) {
        inpUpdate('inpMain', 'Error');
    }
    // Infinityでないとき
    else if (String(formula).endsWith('y') == false) {
        // 桁あふれ対策
        let digit = String(formula).length;
        let i = 7;
        if (formula >= 10 ** 8 || formula <= -(10 ** 8)) {
            if (formula >= 10 ** 21 || formula <= -(10 ** 21)) {
                inpUpdate('inpMain', 'Overflow');
            }
            else {
                if (formula >= 0) {
                    digit = Math.trunc(Math.log10(formula));
                }
                else {
                    digit = Math.trunc(Math.log10(-formula));
                }
                // 有効数字：3+1桁
                digit_round = digit - 3;
                inpUpdate('inpMain', (Math.round(formula / 10 ** digit_round) * 10 ** digit_round / (10 ** digit) + 'e' + digit));
            }
        }
        // 小数を四捨五入して桁を丸める
        else if (formula >= 0 && digit > 8) {
            while (digit > 8) {
                formula = Math.round(formula * 10 ** i) / 10 ** i;
                i--;
                digit = String(formula).length;
                inpUpdate('inpMain', formula);
            }
        }
        else if (formula < 0 && digit >= 8) {
            digit--;
            while (digit > 8) {
                formula = Math.round(formula * 10 ** i) / 10 ** i;
                i--;
                digit = String(formula).length - 1;
                inpUpdate('inpMain', formula);
            }
        }
        else {
            inpUpdate('inpMain', formula);
        }
    }
    // マイナスを半角から全角に置換
    inpUpdate('inpMain', display('inpMain').replace('-', '－'));
}

// イコールボタン押下処理
function pressEqual() {
    // 連続で押下してないとき
    if (display('inpOperator') != '=') {
        // 計算式があるとき
        if (display('inpFormula') != '') {
            inpUpdate('inpOperator', '=');
            if (display('inpMain').startsWith('－') == true) {
                inpAppend('inpFormula', '\(' + display('inpMain') + '\)');
            }
            else {
                inpAppend('inpFormula', display('inpMain'));
            }
            slove();
        }
    }
    // 連続で押下したとき
    else {
        // エラーがないとき
        if (display('inpMain') != 'Overflow' && String(display('inpMain')).endsWith('y') == false && display('inpMain') != 'Error') {
            let again;
            // 最後に入力した演算を繰り返す処理
            if (display('inpFormula').endsWith('\)') == true) {
                again = Math.max(last('÷'), last('×'), display('inpFormula').lastIndexOf('－', last('\(')), last('＋'));
            }
            else {
                again = Math.max(last('÷'), last('×'), last('－'), last('＋'));
            }
            if (display('inpMain').startsWith('－') == true) {
                inpUpdate('inpFormula', '\(' + display('inpMain') + '\)' + display('inpFormula').substr(again));
            }
            else {
                inpUpdate('inpFormula', display('inpMain') + display('inpFormula').substr(again));
            }
            slove();
        }
    }
}

// ボタン押下処理（数値、演算子ボタン）
function pressBtn(value) {
    // エラーであるとき
    if (display('inpMain') == 'Overflow' || String(display('inpMain')).endsWith('y') == true || display('inpMain') == 'Error') {
        if (value != '÷' && value != '×' && value != '－' && value != '＋') {
            inpUpdate('inpOperator', '');
            inpUpdate('inpFormula', '');
            // 新規の計算をするための処理
            if (value == '+/-') {
                inpUpdate('inpMain', '－0');
            }
            else if (value == '.') {
                inpUpdate('inpMain', '0.');
            }
            else if (value == '00') {
                inpUpdate('inpMain', '0');
            }
            else {
                inpUpdate('inpMain', value);
            }
        }
    }
    // エラーでないとき
    else {
        // 直前にイコールボタンを押下していたとき
        if (display('inpOperator') == '=') {
            // 続けて計算するための処理
            if (value == '÷' || value == '×' || value == '－' || value == '＋') {
                inpUpdate('inpOperator', value);
                inpUpdate('inpFormula', display('inpMain'));
                inpAppend('inpFormula', value);
            }
            else {
                inpUpdate('inpOperator', '');
                inpUpdate('inpFormula', '');
                // 解×(－1)
                if (value == '+/-') {
                    if (display('inpMain').startsWith('－') == true) {
                        inpUpdate('inpMain', display('inpMain').slice(1));
                    }
                    else {
                        inpUpdate('inpMain', '－' + display('inpMain'));
                    }
                }
                // 新規の計算をするための処理
                else if (value == '.') {
                    inpUpdate('inpMain', '0.');
                }
                else if (value == '00') {
                    inpUpdate('inpMain', '0');
                }
                else {
                    inpUpdate('inpMain', value);
                }
            }
        }
        // 直前に演算子ボタンを押下していたとき
        else if (display('inpOperator') != '') {
            // 演算子を書き換える処理
            if (value == '÷' || value == '×' || value == '－' || value == '＋') {
                inpUpdate('inpOperator', value);
                endClear('inpFormula');
                inpAppend('inpFormula', value);
            }
            // 次の項を入力する処理
            else {
                inpUpdate('inpOperator', '');
                if (value == '+/-') {
                    inpUpdate('inpMain', '－0');
                }
                else if (value == '.') {
                    inpUpdate('inpMain', '0.');
                }
                else if (value == '00') {
                    inpUpdate('inpMain', '0');
                }
                else {
                    inpUpdate('inpMain', value);
                }
            }
        }
        // 直前に演算子ボタンを押下していないとき
        else {
            // 演算子を押下したとき
            if (value == '÷' || value == '×' || value == '－' || value == '＋') {
                inpUpdate('inpOperator', value);
                if (display('inpMain').endsWith('.') == true) {
                    endClear('inpMain');
                }
                if (display('inpMain').startsWith('－') == true) {
                    inpAppend('inpFormula', '\(' + display('inpMain') + '\)' + value);
                }
                else {
                    inpAppend('inpFormula', display('inpMain') + value);
                }
            }
            // 項×(－1)
            else if (value == '+/-') {
                if (display('inpMain').startsWith('－') == true) {
                    inpUpdate('inpMain', display('inpMain').slice(1));
                }
                else {
                    inpUpdate('inpMain', '－' + display('inpMain'));
                }
            }
            // 続けて数値を入力する処理
            else if (display('inpMain') == '0' || display('inpMain') == '－0') {
                if (value != '00') {
                    if (value != '.') {
                        endClear('inpMain');
                    }
                    inpAppend('inpMain', value);
                }

            }
            // 桁数を制限した数値の入力処理
            // 数値が負のとき
            else if (display('inpMain').startsWith('－') == true && display('inpMain').length <= 8) {
                if (value == '.') {
                    if (display('inpMain').indexOf('.') == -1 && display('inpMain').length <= 7) {
                        inpAppend('inpMain', value);
                    }
                }
                else {
                    inpAppend('inpMain', value);
                }
            }
            // 数値が正のとき
            else if (display('inpMain').length < 8) {
                if (value == '.') {
                    if (display('inpMain').indexOf('.') == -1 && display('inpMain').length < 7) {
                        inpAppend('inpMain', value);
                    }
                }
                else {
                    inpAppend('inpMain', value);
                }
            }
        }
    }
}