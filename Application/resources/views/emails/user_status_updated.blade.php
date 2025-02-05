<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Registration Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
        }
        h1 {
            color: #333333;
            font-size: 24px;
        }
        p {
            color: #555555;
            font-size: 16px;
            line-height: 1.5;
        }
        .status {
            font-weight: bold;
            padding: 10px;
            border-radius: 4px;
        }
        .approved {
            background-color: #d4edda;
            color: #155724;
        }
        .rejected {
            background-color: #f8d7da;
            color: #721c24;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, {{ $username }}</h1>
        <p>Your registration status has been updated to:</p>
        <p class="status {{ $status === 'APPROVED' ? 'approved' : 'rejected' }}">
            <strong>{{ $status }}</strong>
        </p>
        <p>Thank you for your patience!</p>
    </div>
    <div class="footer">
        <p>&copy; {{ date('Y') }} Fourntec. All rights reserved.</p>
    </div>
</body>
</html>
