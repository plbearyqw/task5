const dat = require('../main/datbase.js');
var loadAllItems = dat.loadAllItems;
var loadPromotions = dat.loadPromotions;

function includes(collection, cd){
    for(let each of collection){
              if(each === cd){
                        return true;
              }
    }
    return false;
}

function getBuyItems(inputs){
    let buyItems = [];
    for(let item of inputs){
              let it = /(\w+)-(\d)/g.exec(item);
              let itemCode;
              let itemCount;
              if(it){
                        itemCode = it[1];
                        itemCount = parseInt(it[2],10);
              }else{
                        itemCode = item;
                        itemCount = 1;
              }
              if(!buyItems.find(itemToAdd => itemToAdd.key === itemCode)){
                        buyItems.push({key:itemCode, count:itemCount});
              }else{
                        buyItems.find(itemToAdd => itemToAdd.key === itemCode).count += itemCount;                       
              }
    }
    return buyItems;
}

function getBuyItemsAndPrice(buyItems, allItems, buyTwoGetOne){
    let buyItemsAndPrice = [];
    if(buyItems){
              for(let itemnd of buyItems){
                        let perPrice = allItems.find(each => each.barcode === itemnd.key).price;
                        if(includes(buyTwoGetOne, itemnd.key)){
                                  let toDes = Math.floor(itemnd.count/3);
                                  buyItemsAndPrice.push({key:itemnd.key, price:perPrice*(itemnd.count - toDes)});
                        }else{
                                  buyItemsAndPrice.push({key:itemnd.key, price:perPrice*(itemnd.count)});
                        }
              }   
    }else{
              return [];
    }
    return buyItemsAndPrice;
}

function getBuyList(allItems, buyItems, buyItemsAndPrice){
    let result = '***<没钱赚商店>购物清单***\n';
    let totalPrice = 0.00;
    let less = 0.00;
    for(let each of buyItemsAndPrice){
              result += '名称：' + allItems.find(arg => arg.barcode === each.key).name + 
                    '，数量：' + buyItems.find(arg => arg.key === each.key).count + 
                    allItems.find(arg => arg.barcode === each.key).unit+ 
                    '，单价：' + allItems.find(arg => arg.barcode === each.key).price.toFixed(2)  +
                    '(元)，小计：' + each.price.toFixed(2) + '(元)\n';
              totalPrice += each.price;
    }
    result += '----------------------\n' +
            '挥泪赠送商品：\n';
    for(let each of buyItemsAndPrice){
              if(each.price !== 
              buyItems.find(arg => arg.key === each.key).count *
              allItems.find(arg => arg.barcode === each.key).price){
                        result += '名称：' + allItems.find(arg => arg.barcode === each.key).name +
                              '，数量：' + ((buyItems.find(arg => arg.key === each.key).count *
                              allItems.find(arg => arg.barcode === each.key).price - each.price)/allItems.find(arg => arg.barcode === each.key).price) + 
                              allItems.find(arg => arg.barcode === each.key).unit + '\n';
                        less += buyItems.find(arg => arg.key === each.key).count *
                              allItems.find(arg => arg.barcode === each.key).price - each.price;
              }
    }
    result += '----------------------\n' +
              '总计：' + totalPrice.toFixed(2) + '(元)\n' +
              '节省：' + less.toFixed(2) + '(元)\n' +
              '**********************';

    return result;
}

module.exports = function printInventory(inputs) {
    
    let allItems = loadAllItems();
    let buyTwoGetOne = loadPromotions().find(typ => typ.type === 'BUY_TWO_GET_ONE_FREE').barcodes;
    let buyItems = getBuyItems(inputs);    
    let buyItemsAndPrice = getBuyItemsAndPrice(buyItems, allItems, buyTwoGetOne);
    let result = getBuyList(allItems, buyItems, buyItemsAndPrice);
    console.log(result);
    return result;
};
