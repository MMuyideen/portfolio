---
title: "How to create a Linux (Ubuntu) Virtual Machine in Azure"
date: "2022-09-02"
excerpt: "Creating an Ubuntu Virtual Machine on Azure and connecting to it."
tags: ["Azure", "Linux", "ubuntu"]
draft: false
---


# How to create a Linux (Ubuntu) Virtual Machine in Azure

Creating and connecting to a Linux VM on azure portal can be tricky nevertheless, it is an easy process and only slightly different from windows VM. In this article I’ll be showing how to do just that.
You should already have an azure account and subscription. The subscription can either be your regular paid subscription, free credits for new users or student’s account.

First Step is to login to your account on the Azure portal and click on the Virtual Machine tab. you can also search for it using the search bar.

![Azure portal home page with the Virtual machines tile highlighted among the Azure services shortcuts](./image-01.png)




Click on the create tab at the top left in the virtual machine page and choose Azure Virtual Machine

![Virtual machines blade with the Create menu open and "Azure virtual machine" highlighted](./image-02.png)

Create a new resource group or pick an existing resource group.

![Create a virtual machine form, Project details, with the Create new link under Resource group highlighted and the name prompt open](./image-03.png)

Fill and choose the remaining parameters; 
Virtual Machine name, 
Region should be one close to your location. 
For the sake of this tutorial, no Availability options is needed so pick  *No infrastructure redundancy required*. 
choose your preferred image *Ubuntu*. 
Choose your VM size 

![Instance details of the create form: name Linux, region UK South, Ubuntu Server 20.04 LTS Gen2 image and a Standard_D2s_v3 size](./image-04.png)

Choose your preferred mode of authentication. 
If you chose password it is very important to remember your username and password.
your password must contain uppercase letters, lowercase letters, numbers and must be 12 characters long.

![Administrator account section with authentication type set to Password, a username filled in, and inbound port rules allowing SSH on port 22](./image-05.png)

You can also use SSH key for authentication. you should also remember the username and keypair name or write and store somewhere safe.

![Administrator account section with authentication type set to SSH public key, generating a new key pair and naming it](./image-06.png)

You can click *Review + Create* if you are satisfied or click next to adjust other settings like changing the disk type or implementing auto-shutdown among others

![Inbound port rules allowing SSH from any IP address, with a warning that this is only recommended for testing, and the Review + create and Next: Disks buttons highlighted](./image-07.png)

Review your parameters then click create at the bottom left when you are satisfied. Your VM will begin to deploy

![Review + create tab showing Validation passed, the estimated hourly price and the Create button highlighted](./image-08.png)

If you chose SSH key as your mode of authentication, you will be prompted to download your private key. Click on download and remember the location where it is stored on your computer.



![Generate new key pair dialog warning that Azure does not store the private key, with Download private key and create resource highlighted](./image-09.png)

After Deployment click on *Go to resource*

![Deployment complete page for the Ubuntu VM with the Go to resource button highlighted](./image-10.png)
Copy the IP address located at the top right (different for each VM)

![Overview blade of the LinuxVM virtual machine, running in UK South, with the public IP address highlighted for copying](./image-11.png)

The next step is to download [MobaXterm](https://mobaxterm.mobatek.net/download.html) software and install it.
Open the app after installation. click on Session on the top left corner, click SSH and input the IP address copied earlier the tab for remote host. click OK


![MobaXterm session settings with SSH selected and the VM public IP entered as the remote host, ready to connect on port 22](./image-12.png)

If you are using SSH key pair for authentication, after you input your IP address, click *Advanced SSH settings* tick the box for *use private key* and the import the private key downloaded earlier and click OK


![MobaXterm advanced SSH settings with "Use private key" ticked and the downloaded key file selected](./image-13.png)

You will be required to provide username and password that was provided earlier in the authentication settings. you will be prompted to provide username only if you are using SSH key pair (Note that the no characters will be displayed on your screen when typing your password)

![MobaXterm terminal prompting for the login name and password of the VM administrator account](./image-14.png)
if the username and password provided is correct, you will be successfully logged into the Command Line interface of the Ubuntu VM and can run Linux commands


![MobaXterm connected to the VM, showing the Ubuntu 20.04 LTS welcome banner, system load and a shell prompt](./image-15.png)

## Conclusion
Thank you for reading and I hope this article was helpful for you. Join me in my Cloud journey
[LinkedIn](www.linkedin.com/in/MuyideenMorenigbade)