# Performing credential rotation

This is a fairly standard (if ancient!) practice to ensure that we don't
leave our credentials lying around for too long, Just In Case.

Firstly, you'll need _full admin_ account access in Janus and admin access to the
recipe domains in Fastly.

Note that seperate credentials are used in CODE and PROD; it's recommended to not
rotate them both at the same time but instead do the CODE instance first and follow up
with PROD a few days to a week later.

1. Log into AWS browser console with full admin account access
2. Go to 'IAM' and select users
3. Find the relevant user - there are seperate ones for CODE and PROD recipe cdn access
4. This is a good time to double-check that the permissions policy is still accurate -
   there should be read access to the relevant CDN bucket and **nothing else**
5. Go to the Security Credentials tab
6. Scroll down to find 'Access Keys'
7. There should be one access key present. Don't fiddle with it yet. Click the 'Create Access Key' button above.

_Note that you can only have up to two access keys on a user. Only one should be in use at once; you
can tell which one from the 'Last Used' information. You'll need to delete the oldest if there
is more than one there (this should not happen if people follow these instructions!)_

8. Select 'Custom' for the use case and go through the wizard
9. The last screen gives you the access key id and the secret with handy copy buttons for each. Leave this tab open for now.
10. Open a new tab and go into the Fastly browser console.
11. Find the relevant recipes domain (CODE or PROD)
12. Click it to open, then find the currently `Active` configuration. Click this to open
13. Now click 'Edit Configuration' at the top right and select 'Clone active to new for editing'
14. With this done, you're editable. Find the 'VCL snippets' option on the left-hand side.
15. Select `ProtectedS3Access` and edit it
16. Partway down the window you should see this block. Simply overwrite `awsAccessKey` and `awsSecretKey`.

```vcl
set var.awsAccessKey = "something";   # Change this value to your own data
set var.awsSecretKey = "something";   # Change this value to your own data
set var.awsS3Bucket = "something";   # Change this value to your own data
set var.awsRegion = "something";   # Change this value to your own data
```

17. **Very important** when you click OK on this your settings have not been updated yet. You
    need to click the `Activate` button at the top-right in order to "lock" the configuration
    version and deploy it.
18. Over the next few minutes, requests should gradually stop using the old key.
    I suggest leaving it overnight and then revisiting the IAM page next day.
    You should see that requests have stopped to the old key and are coming through the new one:

19. Now you can disable and remove the old credential!
