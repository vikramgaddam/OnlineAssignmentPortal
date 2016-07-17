#include<stdio.h>
int main()
{
int a,i,n,b;

scanf("%d",&n);

for(i=0;i<n;i++)
{
scanf("%d",&a);
scanf("%d",&b);
if(i!=n-1)
printf("%d\n",a+b)
else
printf("%d",a+b);
}
return 0;
}