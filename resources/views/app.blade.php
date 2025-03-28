<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-app-env="{{ env('APP_ENV') }}">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel + React</title>

         @section('user-data')
         
         <!-- Server Side Props  -->
            <script>
                // Create a global SSR props object with all view data
                window.ssr = {
                    props: {
                       
                        colors: {
                            secondary: "{{ $secondaryColor ?? 'purple-600' }}"
                        },
                        user: @if(!is_null(Auth::user())) {!! json_encode(Auth::user()->toVueObject()) !!} @else null @endif,
                        csrfToken: "{{ csrf_token() }}",
                        baseUrl: "{{ url('/') }}",
                        appName: "{{ config('app.name') }}",
                        
                        
                       // The are props passed to the client side
                        @foreach(get_defined_vars()['__data'] as $key => $value)
                            @if(!in_array($key, ['__env', 'app', 'errors', 'view', 'siteConfiguration']))
                                @if(is_string($value) || is_numeric($value) || is_bool($value))
                                    {{ $key }}: "{{ $value }}",
                                @elseif(is_array($value) || is_object($value))
                                    {{ $key }}: {!! json_encode($value) !!},
                                @endif
                            @endif
                        @endforeach
                        // The are props passed to the client side
                        
                        // Add site configuration
                        siteConfiguration: @if(!empty($siteConfiguration)) {!! json_encode($siteConfiguration) !!} @else {} @endif
                    }
                };

                // Create the Qoutes
                @php
                    $quoteData = ['quote' => '', 'author' => ''];
                    
                    if (isset($testData['quote'])) {
                        $rawQuote = $testData['quote'];
                        // Remove ANSI color codes and formatting
                        $pattern = '/\<options=.*?\>|\<\/\>|\<fg=.*?\>|\<\/\>/';
                        $cleanQuote = preg_replace($pattern, '', $rawQuote);
                        
                        // Replace any newlines with spaces
                        $cleanQuote = str_replace(["\r", "\n"], ' ', $cleanQuote);
                        
                        // Split into quote and author
                        if (preg_match('/^(.+?)\s+—\s+(.+)$/', $cleanQuote, $matches)) {
                            $quoteData['quote'] = trim($matches[1]);
                            $quoteData['author'] = trim($matches[2]);
                        } else {
                            $quoteData['quote'] = trim($cleanQuote);
                        }
                    }
                @endphp


                
                
                window.PterodactylUser = window.ssr.props.user;
                window.inspire = @if(!empty($quoteData['quote'])) {!! json_encode($quoteData) !!} @else null @endif;
                window.SiteConfiguration = window.ssr.props.siteConfiguration;
            </script>
            <!-- End Server Side Props  -->
        @show

        



        @viteReactRefresh

        @vite("resources/app/index.tsx")

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">

    </head>

    <body>
        <div id="root"></div>
    </body>

</html>
