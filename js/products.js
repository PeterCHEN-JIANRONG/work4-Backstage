// esm module
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';
import pagination from './pagination.js'

//  新增、刪除視窗 Modal
let productModal = null;
let delProductModal = null;

const app = createApp({
    data() {
        return {
            apiPath: api_path,
            apiBaseUrl: api_base_url,
            products: [],
            isAdd: false,
            tempProduct: {
                imagesUrl: []
            },
            pagination: {}
        }
    },
    components: {
        pagination
    },
    methods: {
        getLoginToken() {
            // get token from cookie, set axios default headers
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            if (!token) {
                alert("尚未登入");
                window.location = "index.html";
                return
            }
            axios.defaults.headers.common['Authorization'] = token;
        },
        getProducts(page = 1) {
            const url = `${this.apiBaseUrl}/api/${this.apiPath}/admin/products?page=${page}`;
            axios.get(url)
                .then(res => {
                    if (res.data.success) {
                        this.products = res.data.products;
                        this.pagination = res.data.pagination;
                    } else {
                        alert(res.data.message);
                        window.location = "index.html";
                        return
                    }
                })
                .catch(err => {
                    console.dir(err);
                })
        },
        deleteProduct(tempProduct) {
            const url = `${this.apiBaseUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`;
            axios.delete(url)
                .then(res => {
                    if (res.data.success) {
                        // const product = this.products.find(item => item.id === productId);
                        alert(res.data.message);
                        this.getProducts();
                        delProductModal.hide();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch(err => {
                    console.dir(err);
                })
        },
        updateProduct(tempProduct) {
            // default: 新增 method
            let url = `${this.apiBaseUrl}/api/${this.apiPath}/admin/product`;
            let method = 'post';
            // 修改 method
            if (!this.isAdd) {
                url = `${this.apiBaseUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`
                method = 'put';
            }
            axios[method](url, { data: tempProduct })
                .then(res => {
                    if (res.data.success) {
                        alert(res.data.message)
                        productModal.hide();
                        this.getProducts();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch(err => {
                    console.dir(err);
                })
        },
        openModal(option, item) {
            // add & edit modal、delete modal
            switch (option) {
                case 'add':
                    this.isAdd = true; //新增add
                    this.tempProduct = {
                        imagesUrl: []
                    }
                    productModal.show();
                    break;
                case 'edit':
                    this.isAdd = false; //修改edit
                    this.tempProduct = JSON.parse(JSON.stringify(item)); //因為tempProduct.imagesUrl可能會有傳參考問題, 改用深拷貝
                    productModal.show();
                    break;
                case 'delete':
                    this.tempProduct = { ...item };
                    delProductModal.show();
                    break;
            }

        },
        toThousand(num) {
            // 千分位
            let temp = num.toString().split(".");
            temp[0] = temp[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return temp.join(".");
        },
    },
    mounted() {
        // setting axios header token
        this.getLoginToken();
        // get products
        this.getProducts();
    },
})

app.component('productModal', {
    props: ['tempProduct', 'isAdd'],
    template: `
<div id="productModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content border-0">
                    <div class="modal-header bg-dark text-white">
                        <h5 id="productModalLabel" class="modal-title">
                            <span v-if="isAdd">新增產品</span>
                            <span v-else>編輯產品</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-4">
                                <div class="form-group mb-1">
                                    <label for="imageUrl">主要圖片</label>
                                    <input v-model="tempProduct.imageUrl" id="imageUrl" type="text" class="form-control" placeholder="請輸入圖片連結">
                                    <img class="img-fluid" :src="tempProduct.imageUrl" alt="">
                                </div>
                                <div class="mb-1">多圖新增</div>
                                <div v-if="Array.isArray(tempProduct.imagesUrl)">
                                    <div class="mb-1" v-for="(image, index) in tempProduct.imagesUrl" :key="'imagesUrl-'+index">
                                        <div class="form-group mb-1">
                                            <label :for="'images-'+index">圖片網址{{index+1}}</label>
                                            <input v-model="tempProduct.imagesUrl[index]" :id="'images-'+index" type="text" class="form-control" placeholder="請輸入圖片連結">
                                            <img class="img-fluid" :src="image">
                                        </div>
                                    </div>
                                    <div v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                                        <button class="btn btn-outline-primary btn-sm d-block w-100"
                                            @click="tempProduct.imagesUrl.push('')">
                                            新增圖片
                                        </button>
                                    </div>
                                    <div v-else>
                                        <button class="btn btn-outline-danger btn-sm d-block w-100" 
                                            @click="tempProduct.imagesUrl.pop()">
                                            刪除圖片
                                        </button>
                                    </div>
                                </div>
                                <div v-else>
                                    <div>
                                        <button class="btn btn-outline-primary btn-sm d-block w-100" 
                                        @click="createImages">
                                            新增圖片
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-8">
                                <div class="form-group">
                                    <label for="title">標題</label>
                                    <input id="title" type="text" class="form-control" placeholder="請輸入標題" v-model="tempProduct.title">
                                </div>

                                <div class="row">
                                    <div class="form-group col-md-6">
                                        <label for="category">分類</label>
                                        <input id="category" type="text" class="form-control" placeholder="請輸入分類" v-model="tempProduct.category">
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="unit">單位</label>
                                        <input id="unit" type="text" class="form-control" placeholder="請輸入單位" v-model="tempProduct.unit">
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="form-group col-md-6">
                                        <label for="origin_price">原價</label>
                                        <input id="origin_price" type="number" min="0" class="form-control"
                                            placeholder="請輸入原價" v-model.number="tempProduct.origin_price">
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="price">售價</label>
                                        <input id="price" type="number" min="0" class="form-control"
                                            placeholder="請輸入售價" v-model.number="tempProduct.price">
                                    </div>
                                </div>
                                <hr>

                                <div class="form-group">
                                    <label for="description">產品描述</label>
                                    <textarea id="description" type="text" class="form-control" placeholder="請輸入產品描述" v-model="tempProduct.description">
                    </textarea>
                                </div>
                                <div class="form-group">
                                    <label for="content">說明內容</label>
                                    <textarea id="content" type="text" class="form-control" placeholder="請輸入說明內容" v-model="tempProduct.content">
                    </textarea>
                                </div>
                                <div class="form-group">
                                    <div class="form-check">
                                        <input id="is_enabled" class="form-check-input" type="checkbox" :true-value="1"
                                            :false-value="0" v-model="tempProduct.is_enabled">
                                        <label class="form-check-label" for="is_enabled">是否啟用</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            取消
                        </button>
                        <button type="button" class="btn btn-primary" @click="$emit('update-product',tempProduct)">
                            確認
                        </button>
                    </div>
                </div>
            </div>
        </div>`,
    methods: {
        createImages() {
            // 將imagesUrl 賦予空陣列，並塞空字串，好讓v-for渲染 url-input、和顯示刪除Btn
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
        },
    },
    mounted() {
        // !! Modal必須在mounted建立，建立在created會有畫面渲染不到資料的問題
        productModal = new bootstrap.Modal(document.querySelector('#productModal'), {
            keyboard: false,
            backdrop: 'static'
        });
    }
})

app.component('delProductModal', {
    props: ['tempProduct'],
    template: `<div id="delProductModal" ref="delProductModal" class="modal fade" tabindex="-1"
    aria-labelledby="delProductModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0">
            <div class="modal-header bg-danger text-white">
                <h5 id="delProductModalLabel" class="modal-title">
                    <span>刪除產品</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                是否刪除
                <strong class="text-danger">{{tempProduct.title}}</strong> 商品(刪除後將無法恢復)。
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    取消
                </button>
                <button type="button" class="btn btn-danger" @click="$emit('delete-product',tempProduct)">
                    確認刪除
                </button>
            </div>
        </div>
    </div>
</div>`,
    mounted() {
        // !! Modal必須在mounted建立，建立在created會有畫面渲染不到資料的問題
        delProductModal = new bootstrap.Modal(document.querySelector('#delProductModal'), {
            keyboard: false,
            backdrop: 'static'
        })
    }
})

app.mount('#app');