function SignUp(){
    return(
       <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" class="mx-auto h-10 w-auto" />
                <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight">Sign up to create account</h2>
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form action="#" method="POST" class="space-y-6">
                    
                    {/* Username sections */}
                    <div>
                        <label 
                            for="username" 
                            class="block text-sm/6 font-medium"
                        >
                                username
                        </label>
                        <div class="mt-2">
                            <input id="username" 
                                type="text"
                                name="username"
                                class="block w-full rounded-md px-3 py-1.5 text-base outline-1" 
                            />
                        </div>
                    </div>

                    <div>
                        {/* Password sections */}
                        <div class="flex items-center justify-between">
                            <label for="password" class="block text-sm/6 font-medium ">Password</label>
                        </div>
                        <div class="mt-2">
                            <input id="password" 
                            type="password" 
                            name="password" 
                            required 
                            autocomplete="current-password" 
                            class="block w-full rounded-md px-3 py-1.5 text-base outline-1" 
                            />
                        </div>
                    </div>

                    <div>
                        <button 
                            type="submit" 
                            class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 font-semibold text-white hover:bg-indigo-400"
                        >
                            Sign up
                        </button>
                    </div>
                </form>

                <p class="mt-10 text-center text-sm/6 text-gray-400">
                    already a member?
                    <a href="/login" class="font-semibold text-indigo-400 hover:text-indigo-300"> Sign in</a>
                </p>
            </div>
        </div>
    )
}

export default SignUp;