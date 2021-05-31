const app = {
    data() {
        return {
            apiPath: api_path,
            apiBaseUrl: api_base_url,
            user: {
                username: "",
                password: "",
            },
            loginStatusText: "檢查登入",
            loginClassObj: { 'btn-success': false },
        }
    },
    methods: {
        doLogin() {
            axios.post(`${this.apiBaseUrl}/admin/signin`, this.user)
                .then(res => {
                    console.log(res.data);
                    if (res.data.success) {
                        // 解構賦值
                        const { token, expired } = res.data;
                        // set cookie, expired設置有效時間
                        document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
                        window.location = "index.html";
                    } else {
                        alert(`${res.data.message}，請確認帳號、密碼是否輸入正確`);
                        this.user.username = "";
                        this.user.password = "";
                    }
                })
                .catch(err => {
                    console.dir(err);
                })
        },
        checkLoginStatus() {
            // get token
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            // add token to headers
            axios.defaults.headers.common['Authorization'] = token;

            axios.post(`${this.apiBaseUrl}/api/user/check`)
                .then(res => {
                    if (res.data.success) {
                        this.loginClassObj['btn-success'] = true;
                        this.loginStatusText = "檢查(已登入)"
                    } else {
                        this.loginClassObj['btn-success'] = false;
                        this.loginStatusText = "檢查(未登入)"
                    }
                })
        }
    },
    created() {
        this.checkLoginStatus();
    },
}

Vue.createApp(app).mount('#app');